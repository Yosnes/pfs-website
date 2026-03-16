const PRODUCTS = {
  price_1TBLphF8dcdrC71Hh95PYFLH: { file: 'Reinvention Story Pack-FINAL.pdf',         name: 'Reinvention Story Pack' },
  price_1TBLoPF8dcdrC71H0sFah9go: { file: 'Skill Monetization Toolkit-FINAL.pdf',      name: 'Skill Monetization Toolkit' },
  price_1TBLnHF8dcdrC71H43YBOyUk: { file: 'Confidence Reset Protocol-FINAL.pdf',       name: 'Confidence Reset Protocol' },
  price_1TBLmXF8dcdrC71H9I5HIjjh: { file: 'Personal Brand Starter Kit-FINAL.pdf',      name: 'Personal Brand Starter Kit' },
  price_1TBLltF8dcdrC71H687JYbtZ: { file: 'Job Search Accelerator System-FINAL.pdf',   name: 'Job Search Accelerator System' },
  price_1TBLkkF8dcdrC71Hka3eGZIb: { file: 'Career Pivot Playbook-FINAL.pdf',           name: 'Career Pivot Playbook' },
};

async function verifyStripeSignature(body, sigHeader, secret) {
  // Parse t= and v1= from header: "t=1234567890,v1=abc123,v1=def456"
  const parts = sigHeader.split(',');
  let timestamp = null;
  const v1Sigs = [];

  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key === 't') timestamp = val;
    if (key === 'v1') v1Sigs.push(val);
  }

  if (!timestamp || v1Sigs.length === 0) return false;

  const signedPayload = `${timestamp}.${body}`;

  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const sigArray = Array.from(new Uint8Array(sigBuffer));
  const computedHex = sigArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return v1Sigs.some(sig => sig === computedHex);
}

function buildEmailHtml(productName, downloadUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your download is ready</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#FDF6EC;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF6EC;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0D1F3C;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#F5A31A;margin-bottom:6px;">Project Future Self</div>
            <div style="font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#FDF6EC;line-height:1.2;">Your Download Is Ready</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #F5E8CC;border-right:1px solid #F5E8CC;">
            <p style="font-size:15px;color:#3D2E14;line-height:1.7;margin:0 0 8px;">Hi there,</p>
            <p style="font-size:15px;color:#3D2E14;line-height:1.7;margin:0 0 28px;">Thank you for your purchase. Your copy of <strong style="color:#0D1F3C;">${productName}</strong> is ready to download.</p>

            <!-- Product pill -->
            <div style="background:#FDF6EC;border:1.5px solid #F5E8CC;border-radius:10px;padding:18px 22px;margin-bottom:32px;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7A6240;margin-bottom:4px;">Your Product</div>
              <div style="font-size:17px;font-weight:700;color:#0D1F3C;">${productName}</div>
            </div>

            <!-- CTA button -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${downloadUrl}" style="display:inline-block;padding:16px 40px;background:#F5A31A;color:#0D1F3C;font-size:15px;font-weight:800;letter-spacing:0.04em;text-decoration:none;border-radius:32px;text-transform:uppercase;">Download Your File →</a>
            </div>

            <!-- Expiry note -->
            <p style="font-size:12px;color:#7A6240;text-align:center;line-height:1.6;margin:0 0 8px;">This link expires in <strong>24 hours</strong> and allows up to <strong>3 downloads</strong>.</p>
            <p style="font-size:12px;color:#7A6240;text-align:center;line-height:1.6;margin:0;">If you have any issues, reply to this email or contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5E8CC;padding:20px 40px;border-radius:0 0 12px 12px;border:1px solid #F5E8CC;border-top:none;text-align:center;">
            <p style="font-size:11px;font-weight:700;color:#0D1F3C;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">Andrew Asnes</p>
            <p style="font-size:11px;color:#7A6240;margin:0;">Project Future Self &nbsp;·&nbsp; Reinvent. Redesign. Reclaim.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function onRequestPost({ request, env }) {
  const body = await request.text();
  const sigHeader = request.headers.get('stripe-signature') || '';

  console.log('[webhook] received event, sig header present:', !!sigHeader);

  // Verify signature
  const valid = await verifyStripeSignature(body, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error('[webhook] signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  console.log('[webhook] signature verified');

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  console.log('[webhook] event type:', event.type);

  // Only handle checkout completion
  if (event.type !== 'checkout.session.completed') {
    return new Response('OK', { status: 200 });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;

  console.log('[webhook] customer email:', customerEmail);
  console.log('[webhook] session id:', session.id);

  // Fetch line items to get price ID
  const lineItemsRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`,
    {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
    }
  );

  if (!lineItemsRes.ok) {
    const errText = await lineItemsRes.text();
    console.error('[webhook] failed to fetch line items:', errText);
    return new Response('OK', { status: 200 });
  }

  const lineItemsData = await lineItemsRes.json();
  const priceId = lineItemsData.data?.[0]?.price?.id;
  console.log('[webhook] price ID:', priceId);

  const product = PRODUCTS[priceId];

  if (!product) {
    console.error('[webhook] unknown price ID:', priceId);
    return new Response('OK', { status: 200 });
  }

  console.log('[webhook] product:', product.name);

  // Generate download token
  const token = crypto.randomUUID();

  const tokenData = {
    file: product.file,
    name: product.name,
    email: customerEmail,
    expiresAt: Date.now() + 86400000, // 24 hours
    downloads: 0,
    maxDownloads: 3,
  };

  await env.DOWNLOAD_TOKENS.put(token, JSON.stringify(tokenData), {
    expirationTtl: 86400,
  });

  console.log('[webhook] token stored in KV:', token);

  // Send email via Resend
  const downloadUrl = `https://projectfutureself.com/api/download?token=${token}`;

  console.log('[webhook] sending email to:', customerEmail);
  console.log('[webhook] RESEND_API_KEY present:', !!env.RESEND_API_KEY);

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Andrew Asnes <andrew@projectfutureself.com>',
      to: [customerEmail],
      subject: `Your download is ready — ${product.name}`,
      html: buildEmailHtml(product.name, downloadUrl),
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    console.error('[webhook] Resend error:', errText);
  } else {
    const emailData = await emailRes.json();
    console.log('[webhook] email sent, Resend ID:', emailData.id);
  }

  return new Response('OK', { status: 200 });
}
