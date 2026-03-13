import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process create events
    if (event?.type !== 'create') {
      return Response.json({ success: true, skipped: true });
    }

    const application = data;
    const ADMIN_EMAIL = "admin@mlcinsurance.com"; // Update with actual admin email

    // Send email notification
    const emailSubject = `New Broker Application: ${application.full_name}`;
    const emailBody = `
      <h2>New Broker Application Received</h2>
      <p><strong>Name:</strong> ${application.full_name}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>State:</strong> ${application.state}</p>
      <p><strong>Years of Experience:</strong> ${application.years_experience}</p>
      <p><strong>License Types:</strong> ${application.license_types}</p>
      <p><strong>Carriers:</strong> ${application.carriers || 'N/A'}</p>
      <p><strong>Message:</strong> ${application.message || 'N/A'}</p>
      <p><strong>Status:</strong> ${application.status}</p>
      <br>
      <p>View in dashboard: <a href="https://your-app-url.com/leads">Admin Dashboard</a></p>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: emailSubject,
      body: emailBody,
      from_name: "MLC Insurance Broker Portal"
    });

    // Optionally send SMS notification (uncomment and configure ADMIN_PHONE if needed)
    /*
    const ADMIN_PHONE = "+1234567890"; // Update with actual admin phone
    const smsMessage = `New broker application from ${application.full_name} (${application.email}). State: ${application.state}. View dashboard for details.`;
    
    await base44.asServiceRole.functions.invoke('sendSms', {
      to: ADMIN_PHONE,
      message: smsMessage
    });
    */

    return Response.json({ 
      success: true, 
      emailSent: true 
    });
  } catch (error) {
    console.error('Error sending broker application notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});