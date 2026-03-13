import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { lead_id, status, ...additionalData } = body;

    if (!lead_id) {
      return Response.json({ error: 'lead_id is required' }, { status: 400 });
    }

    // Find lead by lead_id
    const leads = await base44.asServiceRole.entities.Lead.filter({ lead_id });
    
    if (!leads || leads.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadRecord = leads[0];
    const updateData = { status };

    // Add optional fields
    Object.keys(additionalData).forEach(key => {
      if (additionalData[key] !== null && additionalData[key] !== undefined && additionalData[key] !== '') {
        updateData[key] = additionalData[key];
      }
    });

    // Update lead
    await base44.asServiceRole.entities.Lead.update(leadRecord.id, updateData);

    return Response.json({ 
      success: true, 
      message: "Lead updated successfully",
      lead_id: leadRecord.id
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});