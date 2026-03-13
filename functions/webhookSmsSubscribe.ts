import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { phone, source = "external_form" } = body;

    if (!phone) {
      return Response.json({ error: 'Missing required field: phone' }, { status: 400, headers: corsHeaders });
    }

    const subscriber = await base44.asServiceRole.entities.SmsSubscriber.create({
      phone: phone.trim(),
      status: "opted_in",
      source,
    });

    return Response.json({ success: true, id: subscriber.id, message: "SMS subscription created successfully" }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
});