import { issueSessionToken, verifyPre2FAToken } from './_shared/adminAuth.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { token, code } = body;

    if (!token || !code) {
      return Response.json({ error: 'Missing token or code' }, { status: 400 });
    }

    const tokenValid = await verifyPre2FAToken(token);
    if (!tokenValid) {
      return Response.json({ success: false, error: 'Login session expired. Please sign in again.' }, { status: 401 });
    }

    const secret = Deno.env.get('TOTP_SECRET');
    if (!secret) {
      return Response.json({ error: '2FA not configured' }, { status: 500 });
    }

    const isValid = await verifyTOTP(secret, code);

    if (isValid) {
      const sessionToken = await issueSessionToken();
      const adminToken = Deno.env.get('ADMIN_PASSWORD_HASH');
      return Response.json({ success: true, sessionToken, adminToken, expiresIn: 4 * 60 * 60 });
    }

    return Response.json({ success: false, error: 'Invalid code' }, { status: 401 });
  } catch (error) {
    console.error('2FA verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function verifyTOTP(secret, token) {
  const window = 1;
  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30;

  for (let i = -window; i <= window; i++) {
    const time = Math.floor(now / timeStep) + i;
    const expectedToken = await generateTOTP(secret, time);
    if (expectedToken === token) return true;
  }
  return false;
}

async function generateTOTP(secret, time) {
  const key = base32Decode(secret);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);

  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const signatureArray = new Uint8Array(signature);

  const offset = signatureArray[signatureArray.length - 1] & 0x0f;
  const binary =
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff);

  return (binary % 1000000).toString().padStart(6, '0');
}

function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.replace(/=+$/, '').toUpperCase();
  let bits = '';

  for (const char of clean) {
    const val = alphabet.indexOf(char);
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }

  return bytes;
}
