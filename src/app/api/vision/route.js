import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Proper, secure server-side validation
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access. Session invalid.' }, { status: 401 });
    }

    // 1. Explicitly Validate Environment Variables
    if (!process.env.N8N_WEBHOOK_URL) {
      console.error("Missing N8N_WEBHOOK_URL environment variable.");
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // 2. Parse Payload
    const body = await request.json();
    const { imageBase64, vehicleId } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate that the vehicle belongs to this operator (Strict Multi-Tenancy Rule)
    if (vehicleId) {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicle_specs')
        .select('id')
        .eq('id', Number(vehicleId))
        .eq('operator_id', user.id)
        .single();

      if (vehicleError || !vehicle) {
        return NextResponse.json({ error: 'Access denied: Vehicle does not belong to this operator.' }, { status: 403 });
      }
    }

    // 3. Construct the prompt
    const openAiPayload = {
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Extract the Odometer reading, Date, Total Cost, Shop Name, and a comma-separated list of Services Performed from this receipt. CRITICAL: For the 'services' list, you MUST include the individual price next to each service name in the format 'Service Name - ₱Price' (e.g. 'Oil Change - ₱1500, Air Filter - ₱800'). Return strictly a raw JSON object with keys: 'odometer' (number), 'date' (YYYY-MM-DD), 'cost' (number), 'shop_name' (string), and 'services' (string). Do not use markdown." 
          },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }],
      temperature: 0
    };

    // 4. Secure Server-to-Server call to n8n
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleId,
        openai_payload: openAiPayload
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n Pipeline Error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}