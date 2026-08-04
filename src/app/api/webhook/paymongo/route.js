import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('paymongo-signature');
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    const elements = signatureHeader.split(',');
    const timestampMap = elements[0].split('=');
    
    const signatureElement = elements.find(el => el.startsWith('te=') || el.startsWith('li='));
    
    if (!signatureElement) {
       return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
    }

    const signatureMap = signatureElement.split('=');
    const timestamp = timestampMap[1];
    const paymongoSignature = signatureMap[1];

    const signatureString = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureString)
      .digest('hex');

    if (expectedSignature !== paymongoSignature) {
      console.error("ALERT: Invalid Webhook Signature Detected");
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    if (payload.data.attributes.type === 'checkout_session.payment.paid') {
      const metadata = payload.data.attributes.data.attributes.metadata;
      const operatorId = metadata?.operatorId;
      
      // Map the incoming count, defaulting to 4 for new PRO deployments
      const targetVehicleCount = parseInt(metadata?.vehicleCount || '4', 10);

      if (operatorId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Guarantee a minimum fleet size of 4 for PRO
        const finalFleetSize = Math.max(4, targetVehicleCount);

        const { error } = await supabase
          .from('operator_profiles') 
          .update({ 
            subscription_tier: 'PRO',
            allowed_fleet_size: finalFleetSize
          })
          .eq('id', operatorId); 

        if (error) throw error;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error.message || error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}