const ADMIN_USERNAME = "Admin";
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000;
const PRE_2FA_DURATION_MS = 10 * 60 * 1000;

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getSigningSecret(): string {
  return Deno.env.get('ADMIN_SESSION_SECRET') || Deno.env.get('ADMIN_PASSWORD_HASH') || 'mlc-admin-fallback-secret';
}

function toBase64Url(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return atob(padded);
}

async function hmacSha256(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSigningSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toBase64Url(new Uint8Array(signature));
}

async function signPayload(payload: Record<string, unknown>): Promise<string> {
  const json = JSON.stringify(payload);
  const encoded = toBase64Url(json);
  const signature = await hmacSha256(encoded);
  return `${encoded}.${signature}`;
}

async function verifySignedPayload<T = Record<string, unknown>>(token: string): Promise<T | null> {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = await hmacSha256(encoded);
  if (expected !== signature) return null;

  try {
    const json = fromBase64Url(encoded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
  if (!storedHash) throw new Error('ADMIN_PASSWORD_HASH not set');
  return username === ADMIN_USERNAME && (await sha256(password)) === storedHash;
}

export async function issuePre2FAToken(): Promise<string> {
  return signPayload({ stage: 'pre2fa', exp: Date.now() + PRE_2FA_DURATION_MS });
}

export async function verifyPre2FAToken(token: string): Promise<boolean> {
  const payload = await verifySignedPayload<{ stage?: string; exp?: number }>(token);
  return Boolean(payload?.stage === 'pre2fa' && typeof payload.exp === 'number' && payload.exp > Date.now());
}

export async function issueSessionToken(): Promise<string> {
  return signPayload({ stage: 'session', exp: Date.now() + SESSION_DURATION_MS });
}

export async function validateSessionToken(token: string): Promise<{ valid: boolean; expiresAt?: number; adminToken?: string; error?: string }> {
  const payload = await verifySignedPayload<{ stage?: string; exp?: number }>(token);
  if (!payload) return { valid: false, error: 'Invalid session' };
  if (payload.stage !== 'session') return { valid: false, error: 'Invalid session stage' };
  if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return { valid: false, error: 'Session expired' };

  const adminToken = Deno.env.get('ADMIN_PASSWORD_HASH');
  if (!adminToken) return { valid: false, error: 'Server misconfigured' };

  return { valid: true, expiresAt: payload.exp, adminToken };
}

export async function verifyAdminToken(adminToken?: string | null): Promise<boolean> {
  const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
  if (!storedHash || !adminToken) return false;
  if (adminToken === storedHash) return true;
  return (await sha256(adminToken)) === storedHash;
}
