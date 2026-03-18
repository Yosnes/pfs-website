export async function onRequestPost({ request, env }) {
  // CORS preflight is handled by Cloudflare Pages automatically for same-origin requests.
  // This function is only called from the same domain, so no CORS headers needed.

  let data;
  try {
    data = await request.json();
    if (!data || !data.name || !data.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const vercelUrl = env.VERCEL_PDF_URL;
  if (!vercelUrl) {
    return new Response(JSON.stringify({ error: 'PDF service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Generate PDF via Vercel
  let pdfBase64, filename;
  try {
    const pdfRes = await fetch(vercelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!pdfRes.ok) {
      const err = await pdfRes.text().catch(() => 'unknown');
      throw new Error(`PDF API returned ${pdfRes.status}: ${err}`);
    }
    const pdfBuffer = await pdfRes.arrayBuffer();
    pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    filename = `${data.name.replace(/\s+/g, '-')}-transformation-report.pdf`;
  } catch (e) {
    console.error('PDF generation failed:', e);
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Send email with PDF attachment via Resend
  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Project Future Self <info@projectfutureself.com>',
        to: [data.email],
        bcc: ['info@projectfutureself.com'],
        subject: `Your Transformation Readiness Report — ${data.scoreLabel}`,
        html: `<p>Hi ${data.name},</p>
<p>Your Transformation Readiness Report is attached. It reflects where you stand right now across the five dimensions of reinvention — and what's available to you from here.</p>
<p>If you have questions or want to talk through what you found, I'm here.</p>
<p>— Andrew</p>
<p style="color:#888;font-size:12px;margin-top:32px">Project Future Self &nbsp;·&nbsp; <a href="https://projectfutureself.com" style="color:#888">projectfutureself.com</a></p>`,
        attachments: [{ filename, content: pdfBase64 }],
      }),
    });
    if (!emailRes.ok) {
      const err = await emailRes.text().catch(() => 'unknown');
      throw new Error(`Resend returned ${emailRes.status}: ${err}`);
    }
  } catch (e) {
    console.error('Email send failed:', e);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Log to Google Sheets (fire-and-forget)
  if (env.SHEETS_WEBHOOK_URL) {
    fetch(env.SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'report_email',
        name: data.name,
        email: data.email,
        scoreLabel: data.scoreLabel,
        overallPct: data.overallPct,
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
