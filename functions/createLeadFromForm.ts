import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Parse request body
    const body = await req.json();
    const {
      lead_id,
      full_name,
      date_of_birth,
      phone,
      email,
      zip_code,
      product_type,
      cta_source,
      source_page,
      language_selected,
      status = "partial_confirmed",
      product_type: step2_product,
      preferred_language,
      household_size,
      estimated_income,
      current_coverage,
      doctors,
      prescriptions,
      notes,
      best_time_to_call,
      preferred_contact_method
    } = body;

    // Build lead data
    const leadData = {
      lead_id,
      full_name,
      date_of_birth,
      phone,
      email,
      zip_code,
      product_type: step2_product || product_type,
      cta_source,
      source_page,
      language_selected,
      status,
      sms_sent: false,
    };

    // Add optional step2 fields
    if (preferred_language) leadData.preferred_language = preferred_language;
    if (household_size) leadData.household_size = parseInt(household_size);
    if (estimated_income) leadData.estimated_income = parseInt(estimated_income);
    if (current_coverage) leadData.current_coverage = current_coverage;
    if (doctors) leadData.doctors = doctors;
    if (prescriptions) leadData.prescriptions = prescriptions;
    if (notes) leadData.notes = notes;
    if (best_time_to_call) leadData.best_time_to_call = best_time_to_call;
    if (preferred_contact_method) leadData.preferred_contact_method = preferred_contact_method;

    // Create lead (accessible to public users)
    const newLead = await base44.asServiceRole.entities.Lead.create(leadData);

    return Response.json({ 
      success: true, 
      lead_id: newLead.id,
      message: "Lead created successfully"
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});