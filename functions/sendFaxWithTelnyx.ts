import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { adminToken, toNumber, attachmentUrls = [], faceSheetHtml } = body;

    const storedToken = Deno.env.get('ADMIN_PASSWORD_HASH');
    if (adminToken !== storedToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!toNumber) {
      return Response.json({ error: 'Missing required field: toNumber' }, { status: 400 });
    }

    // Normalize fax number to E.164 format
    let normalizedNumber = toNumber.replace(/\D/g, '');
    if (!normalizedNumber.startsWith('1')) {
      normalizedNumber = '1' + normalizedNumber;
    }
    const formattedNumber = '+' + normalizedNumber;

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const fromNumber = '+12394881277';

    if (!telnyxApiKey) {
      console.error('Telnyx API key not configured');
      return Response.json({ error: 'Telnyx API key not configured' }, { status: 500 });
    }

    // Build media URLs array
    const mediaUrls = [];
    
    // Add attachments (convert images to PDF if needed via proxy service)
    for (const url of attachmentUrls) {
      mediaUrls.push(url);
    }
    
    // Add face sheet
    if (faceSheetHtml) {
      mediaUrls.push(faceSheetHtml);
    }
    
    if (mediaUrls.length === 0) {
      return Response.json({ error: 'No content to send - please attach a file or generate face sheet' }, { status: 400 });
    }

    // Send fax via Telnyx API
    console.log('Sending fax to:', formattedNumber, 'from:', fromNumber, 'media:', mediaUrls);
    
    const telnyxRes = await fetch('https://api.telnyx.com/v2/faxes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromNumber,
        to: formattedNumber,
        media_urls: mediaUrls,
        quality: "high"
      })
    });

    const telnyxText = await telnyxRes.text();
    
    if (!telnyxRes.ok) {
      console.error('Telnyx API error:', telnyxRes.status, telnyxText);
      return Response.json({ 
        error: 'Failed to send fax via Telnyx',
        status: telnyxRes.status,
        details: telnyxText 
      }, { status: telnyxRes.status });
    }

    let faxData;
    try {
      faxData = JSON.parse(telnyxText);
    } catch (e) {
      console.error('Failed to parse Telnyx response:', telnyxText);
      return Response.json({ error: 'Invalid response from Telnyx' }, { status: 500 });
    }

    // Store fax record in database
    const base44 = createClientFromRequest(req);
    const attachmentNames = attachmentUrls.length > 0 ? `Face Sheet + ${attachmentUrls.length} attachment(s)` : 'Face Sheet';
    await base44.asServiceRole.entities.SentFax.create({
      to_number: formattedNumber,
      sent_at: new Date().toISOString(),
      sender_email: 'admin@mlcinsurance.com',
      status: 'sending',
      telnyx_fax_id: faxData.data?.id,
      attachment_name: attachmentNames,
      attachment_url: faceSheetHtml || null
    });

    return Response.json({
      success: true,
      faxId: faxData.data?.id,
      message: 'Fax sent successfully'
    });
  } catch (error) {
    console.error('Error sending fax:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});