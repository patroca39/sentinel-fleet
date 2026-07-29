import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    // 1. Receive the 'userId' sent by our new Gatekeeper component
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Fetch operator details securely for the PayMongo billing receipt
    const { data: profile } = await supabase
      .from('operator_profiles')
      .select('email, company_name')
      .eq('id', userId)
      .single();

    const email = profile?.email || 'operator@fleet.com';
    const fleetName = profile?.company_name || 'Command Tier Operator';

    // 3. Securely count vehicles using your 'vehicle_specs' table architecture
    const { count, error: countError } = await supabase
      .from('vehicle_specs') 
      .select('*', { count: 'exact', head: true })
      .eq('operator_id', userId); 

    if (countError) throw countError;

    const secureVehicleCount = count || 0;

    // 4. Dynamic Pricing Math Logic
    const basePrice = 99900; // ₱999.00 in centavos
    const baseVehicleLimit = 4;
    const additionalVehiclePrice = 25000; // ₱250.00 in centavos

    let totalAmount = basePrice;
    let dynamicDescription = `Premium Fleet Access (Up to 4 Vehicles)`;

    if (secureVehicleCount > baseVehicleLimit) {
      const extraVehicles = secureVehicleCount - baseVehicleLimit;
      const extraCost = extraVehicles * additionalVehiclePrice;
      totalAmount += extraCost;
      dynamicDescription = `Premium Fleet Access (${secureVehicleCount} Vehicles Total)`;
    }

    // Bulletproof Redirect URLs for Local, Staging, and Production
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: {
              email: email,
              name: fleetName
            },
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: [
              {
                name: 'Sentinel Fleet PRO',
                amount: totalAmount,
                currency: 'PHP',
                quantity: 1,
                description: dynamicDescription
              }
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
            success_url: `${baseUrl}/?payment=success`,
            cancel_url: `${baseUrl}/?payment=cancelled`,
            description: 'Monthly Subscription',
            metadata: {
              operatorId: userId, 
              email: email,
              vehicleCount: secureVehicleCount.toString() 
            }
          }
        }
      })
    };

    // Use the stable v1 endpoint for PayMongo Checkout Sessions
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
    const data = await response.json();

    if (data.errors) {
      console.error("PayMongo Error:", data.errors);
      return NextResponse.json({ error: data.errors[0]?.detail || "Payment gateway error" }, { status: 400 });
    }

    // 5. IMPORTANT: Return exactly as '{ url }' so Gatekeeper.jsx routes correctly
    return NextResponse.json({ url: data.data.attributes.checkout_url }, { status: 200 });

  } catch (error) {
    console.error("Payment Route Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
  }
}