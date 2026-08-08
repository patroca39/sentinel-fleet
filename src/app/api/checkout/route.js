import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { userId, isExpansion } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: profile } = await supabase
      .from('operator_profiles')
      .select('email, company_name')
      .eq('id', userId)
      .single();

    const email = profile?.email || 'operator@fleet.com';
    const fleetName = profile?.company_name || 'Command Tier Operator';

    const { count, error: countError } = await supabase
      .from('vehicle_specs') 
      .select('*', { count: 'exact', head: true })
      .eq('operator_id', userId); 

    if (countError) throw countError;

    let secureVehicleCount = count || 0;

    // DYNAMIC EXPANSION MATH: If expanding, charge for current DB count + 1 new vehicle
    if (isExpansion) {
      secureVehicleCount += 1;
    }

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
            billing: { email: email, name: fleetName },
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
              vehicleCount: secureVehicleCount.toString(),
              isExpansion: isExpansion ? 'true' : 'false' // <-- ADDED: Passes flag to webhook
            }
          }
        }
      })
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0]?.detail || "Payment gateway error" }, { status: 400 });
    }

    return NextResponse.json({ url: data.data.attributes.checkout_url }, { status: 200 });

  } catch (error) {
    console.error("Payment Route Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
  }
}