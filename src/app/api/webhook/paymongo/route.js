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

    // Parse PayMongo's signature header
    const elements = signatureHeader.split(',');
    const timestampMap = elements[0].split('=');
    
    // FIX: Dynamically find either the test (te=) or live (li=) signature 
    const signatureElement = elements.find(el => el.startsWith('te=') || el.startsWith('li='));
    
    if (!signatureElement) {
       return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
    }

    const signatureMap = signatureElement.split('=');
    const timestamp = timestampMap[1];
    const paymongoSignature = signatureMap[1];

    // Generate our hash
    const signatureString = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureString)
      .digest('hex');

    // Compare hashes
    if (expectedSignature !== paymongoSignature) {
      console.error("ALERT: Invalid Webhook Signature Detected");
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // --- SECURE ZONE ---
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