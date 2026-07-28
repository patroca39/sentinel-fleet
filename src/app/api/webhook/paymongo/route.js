import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    // 1. Capture the raw text body for cryptographic verification
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('paymongo-signature');
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    // 2. Parse PayMongo's signature header (Format: t=timestamp,te=test_sig,li=live_sig)
    const elements = signatureHeader.split(',');
    const timestampMap = elements[0].split('=');
    const signatureMap = elements.find(el => el.startsWith(process.env.NODE_ENV === 'production' ? 'li=' : 'te=')).split('=');
    
    const timestamp = timestampMap[1];
    const paymongoSignature = signatureMap[1];

    // 3. Generate our own hash using the timestamp, raw body, and your Secret Key
    const signatureString = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureString)
      .digest('hex');

    // 4. Compare the hashes. If they don't match, this is a fake request.
    if (expectedSignature !== paymongoSignature) {
      console.error("ALERT: Invalid Webhook Signature Detected");
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // --- SECURE ZONE: If we reach here, the payment is 100% verified ---
    
    const payload = JSON.parse(rawBody);
    
    if (payload.data.attributes.type === 'checkout_session.payment.paid') {
      const metadata = payload.data.attributes.data.attributes.metadata;
      const operatorId = metadata.operatorId;

      if (operatorId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase
          .from('operator_profiles') 
          .update({ 
            subscription_tier: 'PRO'
          })
          .eq('id', operatorId); 

        if (error) throw error;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}