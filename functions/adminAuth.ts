import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ADMIN_USERNAME = "Admin";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json({ success: false, error: "Missing credentials" }, { status: 400 });
    }

    const storedHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    if (!storedHash) {
      return Response.json({ success: false, error: "Server misconfigured" }, { status: 500 });
    }

    const passwordHash = await sha256(password);
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = passwordHash === storedHash;

    if (usernameMatch && passwordMatch) {
      return Response.json({ success: true });
    } else {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});