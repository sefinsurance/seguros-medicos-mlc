import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { adminToken } = body;

    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    if (!adminToken || (await hashToken(adminToken)) !== storedHash) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = Deno.env.get('LEADS_API_BASE_URL');
    const apiKey = Deno.env.get('LEADS_API_KEY');

    const response = await fetch(`${baseUrl}/api/prospects`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Postgres API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});