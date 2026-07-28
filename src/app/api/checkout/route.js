import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { email, fleetName, operatorId } = await request.json();

    // 1. Securely initialize Supabase Admin Client
    // The Service Role Key ensures we bypass any frontend restrictions to get an accurate count
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Fetch the true vehicle count directly from the database
    // Note: Verify that 'vehicles' is your exact table name and 'operator_id' is the correct column
    const { count, error: countError } = await supabase
      .from('vehicles') 
      .select('*', { count: 'exact', head: true })
      .eq('operator_id', operatorId); 

    if (countError) throw countError;

    const secureVehicleCount = count || 0;

    // 3. Dynamic Pricing Logic
    const basePrice = 99900; // ₱999.00
    const baseVehicleLimit = 4;
    const additionalVehiclePrice = 25000; // ₱250.00 per extra vehicle

    let totalAmount = basePrice;
    let dynamicDescription = `Pro Tier (Up to 4 Vehicles) for ${fleetName}`;

    // Calculate the extra cost if they exceed the 4-vehicle limit
    if (secureVehicleCount > baseVehicleLimit) {
      const extraVehicles = secureVehicleCount - baseVehicleLimit;
      const extraCost = extraVehicles * additionalVehiclePrice;
      totalAmount += extraCost;
      dynamicDescription = `Pro Tier (${secureVehicleCount} Vehicles Total) for ${fleetName}`;
    }

    // 4. Configure the secure PayMongo API request
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
            line_items: [
              {
                name: 'Sentinel Fleet - Premium Operator Subscription',
                amount: totalAmount,
                currency: 'PHP',
                quantity: 1
              }
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
            // Where to send the user after they pay (or if they back out)
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?payment=cancelled`,
            description: dynamicDescription,
            metadata: {
              operatorId: operatorId, 
              email: email,
              vehicleCount: secureVehicleCount.toString() 
            }
          }
        }
      })
    };

    // 5. Fire the request
    const response = await fetch('https://api.paymongo.com/v2/checkout_sessions', options);
    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0].detail }, { status: 400 });
    }

    return NextResponse.json({ checkoutUrl: data.data.attributes.checkout_url });

  } catch (error) {
    console.error("Payment Route Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
  }
}