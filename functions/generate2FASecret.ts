import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing secret or use the one from env
    const secret = Deno.env.get('TOTP_SECRET');
    
    if (!secret) {
      return Response.json({ 
        error: 'TOTP_SECRET not configured. Please set it in the secrets.' 
      }, { status: 500 });
    }

    // Generate QR code URL for Google Authenticator
    const issuer = 'MLC Insurance';
    const accountName = 'Admin Dashboard';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // Generate QR code as data URL
    const qrCode = await generateQRCode(otpauthUrl);

    return Response.json({
      secret,
      qrCode,
      otpauthUrl
    });
  } catch (error) {
    console.error('2FA generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateQRCode(data) {
  // Use a QR code API service
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  return qrApiUrl;
}