import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Get lead data from automation payload
    let lead = body.data;

    // If payload was too large or missing, fetch it
    if (!lead && body.event?.entity_id) {
      lead = await base44.asServiceRole.entities.Lead.get(body.event.entity_id);
    }

    if (!lead) {
      return Response.json({ error: 'No lead data found' }, { status: 400 });
    }

    const productType = String(lead.product_type || '').trim();
    if (!productType) {
      return Response.json(
        { error: 'Insurance category must be selected.' },
        { status: 400 }
      );
    }

    const ctaLabel =
      lead.cta_source === 'contact_live_agent'
        ? 'Requested Live Agent'
        : 'Instant Quote';

    const preferredLanguage =
      lead.preferred_language || lead.language_selected || 'English';

    const sourceTag = `Website Lead - ${productType}`;

    const results = {};

    // --- SMS Webhook ---
    const smsPayload = {
      name: lead.full_name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      state: lead.state || '',
      source: sourceTag,
      note: [
        `ZIP: ${lead.zip_code || 'N/A'}`,
        `DOB: ${lead.date_of_birth || 'N/A'}`,
        `Language: ${preferredLanguage}`,
        `CTA: ${ctaLabel}`,
        `Source Page: ${lead.source_page || 'N/A'}`,
        `Household Size: ${lead.household_size || 'N/A'}`,
        `Est. Income: ${lead.estimated_income ? '$' + lead.estimated_income : 'N/A'}`,
        `Best Time to Call: ${lead.best_time_to_call || 'N/A'}`,
        `Contact Method: ${lead.preferred_contact_method || 'N/A'}`,
        `Lead ID: ${lead.lead_id || lead.id || 'N/A'}`
      ].join(' | ')
    };

    const smsRes = await fetch('https://sms.obamacarelocal.com/mlcweb/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsPayload),
    });

    let smsResponseBody = null;
    try {
      smsResponseBody = await smsRes.json();
    } catch {
      smsResponseBody = null;
    }

    results.sms = {
      status: smsRes.status,
      ok: smsRes.ok,
      response: smsResponseBody
    };

    // --- Email: send to all admin users ---
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    const emailBody = `
New lead received on MLC Insurance!

━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Name:     ${lead.full_name || 'N/A'}
Phone:    ${lead.phone || 'N/A'}
Email:    ${lead.email || 'N/A'}
ZIP Code: ${lead.zip_code || 'N/A'}
DOB:      ${lead.date_of_birth || 'N/A'}
State:    ${lead.state || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━
INSURANCE INFO
━━━━━━━━━━━━━━━━━━━━━━━━━
Product:  ${productType}
Language: ${preferredLanguage}
CTA:      ${ctaLabel}
Source:   ${sourceTag}

━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITIONAL INFO
━━━━━━━━━━━━━━━━━━━━━━━━━
Household Size:    ${lead.household_size || 'N/A'}
Est. Income:       ${lead.estimated_income ? '$' + lead.estimated_income : 'N/A'}
Best Time to Call: ${lead.best_time_to_call || 'N/A'}
Contact Method:    ${lead.preferred_contact_method || 'N/A'}
Source Page:       ${lead.source_page || 'N/A'}
Lead ID:           ${lead.lead_id || lead.id || 'N/A'}
    `.trim();

    const emailResults = [];
    for (const admin of adminUsers) {
      if (admin.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `🔔 New Lead: ${lead.full_name || 'Unknown'} — ${productType}`,
          body: emailBody,
        });
        emailResults.push(admin.email);
      }
    }

    results.email = { sent_to: emailResults };

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});