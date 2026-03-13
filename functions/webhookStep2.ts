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
      product_type,
      preferred_language,
      household_size,
      estimated_income,
      current_coverage,
      doctors,
      prescriptions,
      notes,
      best_time_to_call,
      preferred_contact_method,
    } = body;

    if (!lead_id) {
      return Response.json({ 
        error: 'lead_id is required' 
      }, { status: 400, headers: corsHeaders });
    }

    // Find lead by lead_id
    const leads = await base44.asServiceRole.entities.Lead.filter({ lead_id });
    
    if (!leads || leads.length === 0) {
      return Response.json({ 
        error: 'Lead not found' 
      }, { status: 404, headers: corsHeaders });
    }

    const leadRecord = leads[0];
    const updateData = { status: "completed" };

    // Add optional fields if provided
    if (product_type) updateData.product_type = product_type;
    if (preferred_language) updateData.preferred_language = preferred_language;
    if (household_size) updateData.household_size = parseInt(household_size);
    if (estimated_income) updateData.estimated_income = parseInt(estimated_income);
    if (current_coverage) updateData.current_coverage = current_coverage;
    if (doctors) updateData.doctors = doctors;
    if (prescriptions) updateData.prescriptions = prescriptions;
    if (notes) updateData.notes = notes;
    if (best_time_to_call) updateData.best_time_to_call = best_time_to_call;
    if (preferred_contact_method) updateData.preferred_contact_method = preferred_contact_method;

    // Update lead
    await base44.asServiceRole.entities.Lead.update(leadRecord.id, updateData);

    return Response.json({ 
      success: true,
      lead_id: leadRecord.id,
      message: "Step 2 lead updated successfully"
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500, headers: corsHeaders });
  }
});