import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const OPT_OUT_WORDS = ['stop', 'unsubscribe'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accept both GET (query params) and POST (JSON body) for webhook flexibility
    let phone = '';
    let message = '';

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      phone = body.phone || body.From || body.from || '';
      message = body.message || body.Body || body.body || body.text || '';
    } else {
      const url = new URL(req.url);
      phone = url.searchParams.get('phone') || url.searchParams.get('From') || '';
      message = url.searchParams.get('message') || url.searchParams.get('Body') || '';
    }

    if (!phone || !message) {
      return Response.json({ error: 'phone and message are required' }, { status: 400 });
    }

    const normalizedMsg = message.trim().toLowerCase();
    const isOptOut = OPT_OUT_WORDS.includes(normalizedMsg);

    if (!isOptOut) {
      return Response.json({ action: 'none', message: 'Not an opt-out keyword' });
    }

    // Normalize phone: strip non-digits
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if already a subscriber record
    const existing = await base44.asServiceRole.entities.SmsSubscriber.filter({ phone: cleanPhone });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.SmsSubscriber.update(existing[0].id, {
        status: 'opted_out',
        opted_out_at: new Date().toISOString(),
      });
    } else {
      // Create an opted-out record to prevent future sends
      await base44.asServiceRole.entities.SmsSubscriber.create({
        phone: cleanPhone,
        status: 'opted_out',
        source: 'reply_opt_out',
        opted_out_at: new Date().toISOString(),
      });
    }

    return Response.json({ action: 'opted_out', phone: cleanPhone, keyword: normalizedMsg });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});