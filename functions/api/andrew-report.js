export async function onRequestPost({ request, env, waitUntil }) {
  const data = await request.json();

  async function generateAndEmail() {
    // 1. Generate PDF via Railway
    const pdfRes = await fetch(env.VERCEL_PDF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!pdfRes.ok) {
      console.error('[andrew-report] PDF generation failed:', await pdfRes.text());
      return;
    }

    const pdfBuffer = await pdfRes.arrayBuffer();

    // Chunked base64 encoding — avoids CPU limit from character-by-character loop
    const bytes = new Uint8Array(pdfBuffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const pdfBase64 = btoa(binary);

    const filename = `${(data.name || 'report').replace(/\s+/g, '-')}-transformation-report.pdf`;

    // 2. Email PDF to Andrew via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Project Future Self <andrew@projectfutureself.com>',
        to: ['andrew@projectfutureself.com'],
        subject: `New Assessment: ${data.name} — ${data.scoreLabel} (${data.overallPct}%)`,
        html: `
          <p>A new Transformation Readiness Assessment was just completed.</p>
          <p><strong>Name:</strong> ${data.name}<br>
          <strong>Email:</strong> ${data.email}<br>
          <strong>Date:</strong> ${data.date}<br>
          <strong>Score:</strong> ${data.overallPct}% — ${data.scoreLabel}<br>
          <strong>Total:</strong> ${data.totalScore}</p>
          <p>Full PDF report is attached.</p>
        `,
        attachments: [{ filename, content: pdfBase64 }],
      }),
    });

    if (!emailRes.ok) {
      console.error('[andrew-report] Resend error:', await emailRes.text());
    } else {
      const d = await emailRes.json();
      console.log('[andrew-report] email sent, Resend ID:', d.id);
    }

    // 3. Email the user a booking invite (no attachment)
    if (data.email) {
      const firstName = (data.name || '').trim().split(/\s+/)[0] || 'there';
      const bookingRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Project Future Self <info@projectfutureself.com>',
          to: [data.email],
          reply_to: 'info@projectfutureself.com',
          subject: 'Let’s review your assessment results',
          html: `<p>Hi ${firstName},</p>
<p>I like to review assessment results on a call. Please find a time for us to meet using this link: <a href="https://calendly.com/andrew-projectfutureself/30min">https://calendly.com/andrew-projectfutureself/30min</a>.</p>
<p>Thank you,<br>Andrew</p>
<p style="color:#888;font-size:12px;margin-top:32px">Project Future Self &nbsp;·&nbsp; <a href="https://projectfutureself.com" style="color:#888">projectfutureself.com</a></p>`,
        }),
      });

      if (!bookingRes.ok) {
        console.error('[andrew-report] booking email error:', await bookingRes.text());
      } else {
        const b = await bookingRes.json();
        console.log('[andrew-report] booking email sent, Resend ID:', b.id);
      }
    }
  }

  // Return 200 immediately — PDF generation runs in background
  waitUntil(generateAndEmail());

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
