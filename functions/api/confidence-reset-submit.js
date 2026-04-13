const CALENDLY = 'https://calendly.com/andrew-projectfutureself/30min';

function esc(s) {
  return (s || '').toString()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildUserEmail(name) {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}</style></head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
  <tr><td style="background:#0D1F3C;border-radius:12px 12px 0 0;padding:28px 36px">
    <div style="font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5A31A;margin-bottom:6px">PROJECT FUTURE SELF</div>
    <div style="font-size:20px;font-weight:800;color:#FDF6EC">Confidence Reset Protocol</div>
  </td></tr>
  <tr><td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #F5E8CC;border-right:1px solid #F5E8CC">
    <p style="font-size:16px;color:#0D1F3C;margin-bottom:20px">Hi ${esc(firstName)},</p>
    <p style="font-size:15px;color:#3D2E14;line-height:1.75;margin-bottom:20px">Your Confidence Reset Protocol is attached as a PDF &mdash; all six days, fully compiled from your answers.</p>
    <p style="font-size:15px;color:#3D2E14;line-height:1.75;margin-bottom:28px">Return to Day 3 whenever you feel doubt creeping back. Your Future Self anchor and interrupt script are your most important tools from here.</p>
    <div style="background:#FDF6EC;border-radius:8px;padding:20px 22px;margin-bottom:28px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C07D0A;margin-bottom:12px">Two Things to Do Right Now</div>
      <div style="margin-bottom:10px;display:flex;gap:10px">
        <div style="width:22px;height:22px;min-width:22px;border-radius:50%;background:#0D1F3C;color:#F5A31A;font-size:10px;font-weight:800;text-align:center;line-height:22px">1</div>
        <p style="font-size:14px;color:#3D2E14;line-height:1.65;margin:0"><strong>Read your Future Self anchor statement out loud.</strong> Notice how it feels to hear your own words as a statement of identity, not aspiration.</p>
      </div>
      <div style="display:flex;gap:10px">
        <div style="width:22px;height:22px;min-width:22px;border-radius:50%;background:#0D1F3C;color:#F5A31A;font-size:10px;font-weight:800;text-align:center;line-height:22px">2</div>
        <p style="font-size:14px;color:#3D2E14;line-height:1.65;margin:0"><strong>Start your Day 5 momentum routine tomorrow morning.</strong> Consistency over the next 7 days is what turns this reset into a new baseline.</p>
      </div>
    </div>
    <div style="background:#0D1F3C;border-radius:10px;padding:24px 28px;text-align:center;margin-bottom:28px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#F5A31A;margin-bottom:8px">Want to work through this together?</div>
      <div style="font-size:18px;font-weight:700;color:#FDF6EC;margin-bottom:8px">Book a 30-Minute Call with Andrew</div>
      <p style="font-size:13px;color:rgba(253,246,236,.7);line-height:1.65;margin-bottom:18px">Talk through your reset, get unstuck, and leave with clarity on your next move.</p>
      <a href="${CALENDLY}" style="display:inline-block;padding:12px 28px;background:#F5A31A;color:#0D1F3C;font-weight:800;font-size:13px;border-radius:32px;text-decoration:none">Schedule a Call with Andrew &rarr;</a>
    </div>
    <p style="font-size:14px;color:#3D2E14;line-height:1.75;margin-bottom:6px">&mdash; Andrew</p>
    <p style="font-size:13px;color:#7A6240">Project Future Self</p>
  </td></tr>
  <tr><td style="background:#0D1F3C;border-radius:0 0 12px 12px;padding:18px 36px;text-align:center">
    <p style="font-size:11px;color:rgba(253,246,236,.35);margin-bottom:4px">Project Future Self &nbsp;&middot;&nbsp; <a href="https://projectfutureself.com" style="color:rgba(253,246,236,.35);text-decoration:none">projectfutureself.com</a></p>
    <p style="font-size:10px;color:rgba(253,246,236,.2)">For support, email <a href="mailto:support@projectfutureself.com" style="color:rgba(253,246,236,.3)">support@projectfutureself.com</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildAndrewEmail(name, email, date, answers) {
  const preview = (key, len) => {
    len = len || 80;
    const v = answers[key];
    if (!v || !String(v).trim()) return '<em style="color:#999">Not completed</em>';
    const t = String(v).trim();
    return esc(t.length > len ? t.slice(0, len) + '...' : t);
  };
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f5f0e8;margin:0;padding:24px">
<div style="max-width:560px;background:#fff;border-radius:10px;padding:32px;border:1px solid #F5E8CC">
  <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:6px">Project Future Self &mdash; New Submission</div>
  <h2 style="font-size:20px;color:#0D1F3C;margin-bottom:20px">Confidence Reset Protocol</h2>
  <table style="width:100%;font-size:14px;color:#3D2E14;margin-bottom:24px">
    <tr><td style="padding:6px 0;font-weight:700;width:100px">Name:</td><td>${esc(name)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:700">Email:</td><td><a href="mailto:${esc(email)}" style="color:#0D1F3C">${esc(email)}</a></td></tr>
    <tr><td style="padding:6px 0;font-weight:700">Date:</td><td>${date}</td></tr>
  </table>
  <div style="border-top:1px solid #F5E8CC;padding-top:18px;margin-bottom:8px">
    <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C07D0A;margin-bottom:14px">Key Answers Preview</div>
    <p style="font-size:13px;margin-bottom:4px"><strong>D1 Root Cause:</strong> ${preview('cr_d1_root')}</p>
    <p style="font-size:13px;margin-bottom:4px"><strong>D3 Anchor Statement:</strong> ${preview('cr_d3_anchor')}</p>
    <p style="font-size:13px;margin-bottom:16px"><strong>D5 Forward Plan:</strong> ${preview('cr_d5_plan')}</p>
  </div>
  <p style="font-size:13px;color:#7A6240">Full protocol PDF is attached. Reply to this email to respond directly to ${esc(name.split(' ')[0])}.</p>
</div>
</body></html>`;
}

export async function onRequestPost({ request, env, waitUntil }) {
  // 1. Parse & validate
  let data;
  try {
    data = await request.json();
    if (!data || !data.name || !data.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!env.VERCEL_PDF_URL || !env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Service not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, answers = {} } = data;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const filename = `${name.replace(/\s+/g, '-')}-confidence-reset-protocol.pdf`;

  // 2. Return 200 immediately — PDF generation and email happen in background
  // This matches the working pattern of andrew-report.js
  waitUntil((async () => {
    try {
      // Derive Railway base URL robustly — works regardless of path in VERCEL_PDF_URL
      const railwayBase = new URL(env.VERCEL_PDF_URL).origin;
      const pdfUrl = railwayBase + '/api/generate-confidence-reset-pdf';

      const pdfRes = await fetch(pdfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, answers }),
      });
      if (!pdfRes.ok) {
        console.error('[confidence-reset] Railway error:', pdfRes.status, await pdfRes.text().catch(() => ''));
        return;
      }

      const pdfBuffer = await pdfRes.arrayBuffer();
      const bytes = new Uint8Array(pdfBuffer);
      const chunkSize = 0x8000;
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      const pdfBase64 = btoa(binary);

      // Send user email
      const userRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Project Future Self <info@projectfutureself.com>',
          to: [email],
          bcc: ['info@projectfutureself.com'],
          subject: `Your Confidence Reset Protocol — ${name.split(' ')[0]}, your completed workbook`,
          html: buildUserEmail(name),
          attachments: [{ filename, content: pdfBase64 }],
        }),
      });
      if (!userRes.ok) {
        console.error('[confidence-reset] Resend user error:', userRes.status, await userRes.text().catch(() => ''));
      } else {
        console.log('[confidence-reset] User email sent to', email);
      }

      // Send Andrew notification
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Project Future Self <info@projectfutureself.com>',
          to: ['andrew@projectfutureself.com'],
          reply_to: email,
          subject: `New Protocol: ${name} — Confidence Reset (${date})`,
          html: buildAndrewEmail(name, email, date, answers),
          attachments: [{ filename, content: pdfBase64 }],
        }),
      }).catch(e => console.error('[confidence-reset] Andrew email error:', e));

      // Log to Google Sheets
      if (env.SHEETS_WEBHOOK_URL) {
        fetch(env.SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'confidence_reset', name, email, date }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('[confidence-reset] Unhandled error:', e);
    }
  })());

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
