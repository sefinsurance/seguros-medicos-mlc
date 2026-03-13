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

    const {
      lead_id,
      full_name,
      date_of_birth,
      phone,
      email,
      zip_code,
      product_type,
      cta_source = "instant_quote",
      source_page = "external_form",
      language_selected = "en",
    } = body;

    // Validate required fields
    const required = ['lead_id', 'full_name', 'date_of_birth', 'phone', 'email', 'zip_code', 'product_type'];
    const missing = required.filter(field => !body[field]);
    
    if (missing.length > 0) {
      return Response.json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      }, { status: 400, headers: corsHeaders });
    }

    // Create lead
    const newLead = await base44.asServiceRole.entities.Lead.create({
      lead_id,
      full_name: full_name.trim(),
      date_of_birth,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      zip_code: zip_code.trim(),
      product_type,
      cta_source,
      source_page,
      language_selected,
      status: "partial_confirmed",
      sms_sent: false,
    });

    // Manually trigger notify + sheet automation since asServiceRole bypasses entity triggers
    try {
      await base44.asServiceRole.functions.invoke('notifyNewLead', { data: newLead, event: { type: 'create', entity_name: 'Lead', entity_id: newLead.id } });
    } catch (_) { /* non-blocking */ }
    try {
      await base44.asServiceRole.functions.invoke('appendLeadToSheet', { data: newLead, event: { type: 'create', entity_name: 'Lead', entity_id: newLead.id } });
    } catch (_) { /* non-blocking */ }

    return Response.json({ 
      success: true,
      lead_id: lead_id,
      message: "Step 1 lead created successfully"
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500, headers: corsHeaders });
  }
});