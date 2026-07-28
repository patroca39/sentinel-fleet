import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { email, fleetName, operatorId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // MERGE FIX 1: Use 'vehicle_specs' to match your actual database architecture
    const { count, error: countError } = await supabase
      .from('vehicle_specs') 
      .select('*', { count: 'exact', head: true })
      .eq('operator_id', operatorId); 

    if (countError) throw countError;

    const secureVehicleCount = count || 0;

    // YOUR EXCELLENT MATH LOGIC
    const basePrice = 99900; // ₱999.00
    const baseVehicleLimit = 4;
    const additionalVehiclePrice = 25000; // ₱250.00 per extra vehicle

    let totalAmount = basePrice;
    let dynamicDescription = `Premium Fleet Access (Up to 4 Vehicles)`;

    if (secureVehicleCount > baseVehicleLimit) {
      const extraVehicles = secureVehicleCount - baseVehicleLimit;
      const extraCost = extraVehicles * additionalVehiclePrice;
      totalAmount += extraCost;
      dynamicDescription = `Premium Fleet Access (${secureVehicleCount} Vehicles Total)`;
    }

    // MERGE FIX 2: Bulletproof Redirect URLs for Local, Staging, and Production
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
            // MERGE FIX 3: Keep billing object to auto-fill the customer's email at checkout
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
            // Includes your QRPH addition
            payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
            success_url: `${baseUrl}/?payment=success`,
            cancel_url: `${baseUrl}/?payment=cancelled`,
            description: 'Monthly Subscription',
            metadata: {
              operatorId: operatorId, 
              email: email,
              vehicleCount: secureVehicleCount.toString() 
            }
          }
        }
      })
    };

    // MERGE FIX 4: Use the stable v1 endpoint for PayMongo Checkout Sessions
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
    const data = await response.json();

    if (data.errors) {
      console.error("PayMongo Error:", data.errors);
      return NextResponse.json({ error: data.errors[0]?.detail || "Payment gateway error" }, { status: 400 });
    }

    return NextResponse.json({ checkoutUrl: data.data.attributes.checkout_url }, { status: 200 });

  } catch (error) {
    console.error("Payment Route Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
  }
}