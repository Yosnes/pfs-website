const PRODUCTS = {
  price_1TCjYyF6VZVb4XEICZIVq9qp: { file: 'Reinvention Story Pack-FINAL.pdf',         name: 'Reinvention Story Pack' },
  price_1TCjZ2F6VZVb4XEIthU2o9zy: { file: 'Skill Monetization Toolkit-FINAL.pdf',      name: 'Skill Monetization Toolkit' },
  price_1TCjZ4F6VZVb4XEIKDzarUqM: { file: 'Confidence Reset Protocol-FINAL.pdf',       name: 'Confidence Reset Protocol' },
  price_1TCjZ6F6VZVb4XEI1eezZHWj: { file: 'Personal Brand Starter Kit-FINAL.pdf',      name: 'Personal Brand Starter Kit' },
  price_1TCjZ9F6VZVb4XEIonDOyhUn: { file: 'Job Search Accelerator System-FINAL.pdf',   name: 'Job Search Accelerator System' },
  price_1TCjZAF6VZVb4XEId0grYtvR: { file: 'Career Pivot Playbook-FINAL.pdf',           name: 'Career Pivot Playbook' },
};

async function verifyStripeSignature(body, sigHeader, secret) {
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
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(signedPayload));
  const computedHex = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return v1Sigs.some(sig => sig === computedHex);
}

function buildEmailHtml(items) {
  // items: [{ name, url }]
  const isMulti = items.length > 1;
  const subject = isMulti ? 'Your downloads are ready' : 'Your download is ready';

  const itemsHtml = items.map(item => `
    <!-- Product row -->
    <div style="background:#FDF6EC;border:1.5px solid #F5E8CC;border-radius:10px;padding:18px 22px;margin-bottom:16px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7A6240;margin-bottom:4px;">Your Product</div>
      <div style="font-size:16px;font-weight:700;color:#0D1F3C;margin-bottom:14px;">${item.name}</div>
      <div style="text-align:center;">
        <a href="${item.url}" style="display:inline-block;padding:12px 32px;background:#F5A31A;color:#0D1F3C;font-size:13px;font-weight:800;letter-spacing:0.04em;text-decoration:none;border-radius:32px;text-transform:uppercase;">Download →</a>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
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
            <div style="font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#FDF6EC;line-height:1.2;">${isMulti ? 'Your Downloads Are Ready' : 'Your Download Is Ready'}</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #F5E8CC;border-right:1px solid #F5E8CC;">
            <p style="font-size:15px;color:#3D2E14;line-height:1.7;margin:0 0 8px;">Hi there,</p>
            <p style="font-size:15px;color:#3D2E14;line-height:1.7;margin:0 0 28px;">Thank you for your purchase. ${isMulti ? 'Your files are ready to download below.' : `Your copy of <strong style="color:#0D1F3C;">${items[0].name}</strong> is ready to download.`}</p>

            ${itemsHtml}

            <!-- Expiry note -->
            <p style="font-size:12px;color:#7A6240;text-align:center;line-height:1.6;margin:16px 0 8px;">Each link expires in <strong>24 hours</strong> and allows up to <strong>3 downloads</strong>.</p>
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

  if (event.type !== 'checkout.session.completed') {
    return new Response('OK', { status: 200 });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;

  console.log('[webhook] customer email:', customerEmail);
  console.log('[webhook] session id:', session.id);

  // Fetch all line items
  const lineItemsRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=100`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );

  if (!lineItemsRes.ok) {
    console.error('[webhook] failed to fetch line items:', await lineItemsRes.text());
    return new Response('OK', { status: 200 });
  }

  const lineItemsData = await lineItemsRes.json();
  console.log('[webhook] line item count:', lineItemsData.data?.length);

  // Generate a token for each product and collect download info
  const emailItems = [];

  for (const lineItem of lineItemsData.data) {
    const priceId = lineItem.price?.id;
    const product = PRODUCTS[priceId];

    if (!product) {
      console.error('[webhook] unknown price ID:', priceId);
      continue;
    }

    const token = crypto.randomUUID();
    const tokenData = {
      file: product.file,
      name: product.name,
      email: customerEmail,
      expiresAt: Date.now() + 86400000,
      downloads: 0,
      maxDownloads: 3,
    };

    await env.DOWNLOAD_TOKENS.put(token, JSON.stringify(tokenData), { expirationTtl: 86400 });
    console.log('[webhook] token stored for:', product.name);

    emailItems.push({
      name: product.name,
      url: `https://projectfutureself.com/api/download?token=${token}`,
    });

    // Log download to Google Sheets
    if (env.SHEETS_WEBHOOK_URL) {
      await fetch(env.SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'download', email: customerEmail, name: '', product: product.name }),
      }).catch(err => console.error('[webhook] Sheets error:', err));
    }
  }

  if (emailItems.length === 0) {
    console.error('[webhook] no valid products found in order');
    return new Response('OK', { status: 200 });
  }

  console.log('[webhook] sending email with', emailItems.length, 'item(s) to:', customerEmail);
  console.log('[webhook] RESEND_API_KEY present:', !!env.RESEND_API_KEY);

  const subject = emailItems.length > 1
    ? `Your downloads are ready — ${emailItems.length} items`
    : `Your download is ready — ${emailItems[0].name}`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Andrew Asnes <andrew@projectfutureself.com>',
      to: [customerEmail],
      subject,
      html: buildEmailHtml(emailItems),
    }),
  });

  if (!emailRes.ok) {
    console.error('[webhook] Resend error:', await emailRes.text());
  } else {
    const emailData = await emailRes.json();
    console.log('[webhook] email sent, Resend ID:', emailData.id);
  }

  return new Response('OK', { status: 200 });
}
