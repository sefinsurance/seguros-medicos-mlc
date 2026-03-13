import { validateSessionToken } from './_shared/adminAuth.ts';

Deno.serve(async (req) => {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return Response.json({ valid: false, error: 'Missing session token' }, { status: 401 });
    }

    const result = await validateSessionToken(sessionToken);
    return Response.json(result, { status: result.valid ? 200 : 401 });
  } catch (error) {
    console.error('Session validation error:', error);
    return Response.json({ valid: false, error: error.message || 'Session validation failed' }, { status: 500 });
  }
});
