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

    const { full_name, email, phone, state, years_experience, license_types, carriers, message } = body;

    if (!full_name || !email || !phone) {
      return Response.json({ error: 'Missing required fields: full_name, email, phone' }, { status: 400, headers: corsHeaders });
    }

    const application = await base44.asServiceRole.entities.BrokerApplication.create({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      state: state || "",
      years_experience: years_experience || "",
      license_types: license_types || "",
      carriers: carriers || "",
      message: message || "",
      status: "new",
    });

    return Response.json({ success: true, id: application.id, message: "Broker application submitted successfully" }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
});