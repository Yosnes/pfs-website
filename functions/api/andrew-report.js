export async function onRequestPost({ request, env }) {
  const data = await request.json();

  // 1. Generate PDF via Railway
  const pdfRes = await fetch(env.VERCEL_PDF_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!pdfRes.ok) {
    console.error('[andrew-report] PDF generation failed:', await pdfRes.text());
    return new Response('PDF failed', { status: 502 });
  }

  const pdfBuffer = await pdfRes.arrayBuffer();

  // Safe base64 encoding for edge runtime (avoids spread stack limit on large PDFs)
  let binary = '';
  const bytes = new Uint8Array(pdfBuffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
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

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
