const CALENDLY = 'https://calendly.com/andrew-projectfutureself/30min';

const esc = s =>
  (s || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const val = (v, fallback = '<span style="color:#ccc;font-style:italic">Not completed</span>') =>
  v && v.trim() ? esc(v) : fallback;

// ── REPORT HTML BUILDER ──────────────────────────────────────────────────────

function field(label, value) {
  return `
  <div style="margin-bottom:20px">
    <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:7px">${label}</div>
    <div style="background:#fff;border:1px solid #F5E8CC;border-radius:8px;padding:15px 18px;font-size:13px;color:#3D2E14;line-height:1.7;min-height:46px">${val(value)}</div>
  </div>`;
}

function assemblyField(label, value) {
  return `
  <div style="margin-top:6px">
    <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:8px">${label}</div>
    <div style="background:#FDF6EC;border:1.5px solid #F5A31A;border-radius:8px;padding:18px 20px;font-size:13px;color:#3D2E14;line-height:1.8;min-height:80px">${val(value)}</div>
  </div>`;
}

function moduleHeader(num, eyebrow, title) {
  return `
  <div style="page-break-before:always;background:#0D1F3C;padding:24px 40px;display:flex;align-items:center;gap:16px">
    <div style="width:38px;height:38px;border-radius:50%;background:#F5A31A;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:800;color:#0D1F3C;flex-shrink:0">${num}</div>
    <div>
      <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#F5A31A;margin-bottom:3px">${eyebrow}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#FDF6EC;line-height:1.2">${title}</div>
    </div>
  </div>
  <div style="background:#fff;border:1px solid #F5E8CC;border-top:none;padding:28px 40px">`;
}

function buildCoverPage(name, date) {
  const chips = ['Before / After Story','Tell Me About Yourself','Interview Story Bank','Networking Scripts','Transition Talking Points'];
  return `
  <div style="background:#0D1F3C;min-height:600px;padding:72px 52px 56px;display:flex;flex-direction:column;justify-content:center">
    <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#F5A31A;margin-bottom:20px">PROJECT FUTURE SELF · STORY SYSTEM</div>
    <div style="font-family:'DM Serif Display',serif;font-size:48px;color:#FDF6EC;line-height:1.1;margin-bottom:6px">Reinvention</div>
    <div style="font-family:'DM Serif Display',serif;font-size:48px;color:#F5A31A;line-height:1.1;margin-bottom:24px">Story Pack</div>
    <div style="width:48px;height:3px;background:#F5A31A;border-radius:2px;margin-bottom:24px"></div>
    <div style="font-size:18px;color:rgba(253,246,236,.7);margin-bottom:4px">Completed by: <strong style="color:#FDF6EC">${esc(name)}</strong></div>
    <div style="font-size:13px;color:rgba(253,246,236,.45);margin-bottom:40px">${date}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${chips.map((c, i) => `<span style="background:rgba(245,163,26,.12);border:1px solid rgba(245,163,26,.3);color:#F5A31A;font-size:10px;font-weight:700;letter-spacing:.05em;padding:5px 12px;border-radius:20px">${i+1}. ${c}</span>`).join('')}
    </div>
  </div>`;
}

function buildModule1(a) {
  return moduleHeader('1', 'Module 01 · Before → After Transformation Story', 'Build Your Core Reinvention Narrative') +
    field('1 · Context — Where You Were', a.m1_context) +
    field('2 · Catalyst — What Shifted', a.m1_catalyst) +
    field('3 · Choice — Your Intentional Decision', a.m1_choice) +
    field('4 · Capability — Your Value Now', a.m1_capability) +
    field('5 · Direction — Where You\'re Going', a.m1_direction) +
    `<div style="height:1.5px;background:#F5A31A;opacity:.4;margin:8px 0 20px"></div>` +
    assemblyField('Final Story Assembly — Your Complete Before / After Narrative (30–45 seconds when spoken)', a.m1_final) +
    `</div>`;
}

function buildModule2(a) {
  const versions = [
    ['Version 1 — Interview', 'Most formal · role-specific · high stakes', a.m2_interview],
    ['Version 2 — Networking', 'Warmer tone · conversation-starter · no job ask', a.m2_networking],
    ['Version 3 — Casual / Social', 'Relaxed · shorter · no jargon', a.m2_casual],
  ];
  return moduleHeader('2', 'Module 02 · Tell Me About Yourself Script', 'Answer the Most Common Question Without Rambling') +
    versions.map(([title, meta, value]) => `
    <div style="border:1px solid #F5E8CC;border-radius:8px;overflow:hidden;margin-bottom:16px">
      <div style="background:#0D1F3C;padding:10px 16px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#fff">${title}</span>
        <span style="font-size:10px;color:rgba(255,255,255,.45)">${meta}</span>
      </div>
      <div style="padding:14px 16px;background:#fff;font-size:13px;color:#3D2E14;line-height:1.75;min-height:60px">${val(value)}</div>
    </div>`).join('') +
    `</div>`;
}

function starRow(letter, name, value, isAction = false, isPivot = false) {
  if (isPivot) {
    return `
    <div style="background:#0D1F3C;border-radius:6px;padding:12px 14px;margin-top:10px;display:flex;gap:12px;align-items:flex-start">
      <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#F5A31A;padding-top:2px;flex-shrink:0;width:60px">PIVOT</div>
      <div style="font-size:13px;color:rgba(253,246,236,.9);line-height:1.7;min-height:36px">${val(value, '<span style="color:rgba(255,255,255,.25);font-style:italic">Not completed</span>')}</div>
    </div>`;
  }
  return `
  <div style="display:grid;grid-template-columns:56px 1fr;gap:0;margin-bottom:6px;align-items:stretch">
    <div style="padding-top:12px">
      <div style="font-size:15px;font-weight:800;color:${isAction ? '#C07D0A' : '#0D1F3C'}">${letter}</div>
      <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#7A6240;margin-top:1px">${name}</div>
    </div>
    <div style="background:#FDF6EC;border:1px solid #F5E8CC;border-radius:6px;padding:10px 13px;font-size:13px;color:#3D2E14;line-height:1.65;min-height:42px">${val(value)}</div>
  </div>`;
}

function buildStory(num, a, prefix) {
  const title = a[`${prefix}_title`] || `Story ${num}`;
  const theme = a[`${prefix}_theme`] || '';
  return `
  <div style="border:1px solid #F5E8CC;border-radius:8px;overflow:hidden;margin-bottom:20px">
    <div style="background:#0D1F3C;padding:12px 18px;display:flex;align-items:center;gap:14px">
      <span style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A">Story ${String(num).padStart(2,'0')}</span>
      <span style="font-size:13px;font-weight:600;color:#fff">${esc(title)}</span>
      ${theme ? `<span style="font-size:11px;color:rgba(255,255,255,.45);margin-left:auto">${esc(theme)}</span>` : ''}
    </div>
    <div style="padding:16px 18px;background:#fff">
      ${starRow('S','Situation', a[`${prefix}_situation`])}
      ${starRow('T','Task', a[`${prefix}_task`])}
      ${starRow('A','Action', a[`${prefix}_action`], true)}
      ${starRow('R','Result', a[`${prefix}_result`])}
      ${starRow('T+','Transferable', a[`${prefix}_transferable`])}
      ${starRow('','Pivot', a[`${prefix}_pivot`], false, true)}
    </div>
  </div>`;
}

function buildModule3(a) {
  const rows = Array.from({length: 8}, (_, i) => {
    const n = i + 1;
    const t = a[`m3_inv_${n}_title`] || '';
    const th = a[`m3_inv_${n}_theme`] || '';
    const s = a[`m3_inv_${n}_summary`] || '';
    return `<tr style="background:${i%2===0?'#fff':'#FDF6EC'}">
      <td style="padding:9px 12px;border:1px solid #F5E8CC;font-size:10px;font-weight:700;color:#7A6240;text-align:center;background:#F5E8CC;width:36px">${String(n).padStart(2,'0')}</td>
      <td style="padding:9px 12px;border:1px solid #F5E8CC;font-size:13px;color:#3D2E14">${val(t,'—')}</td>
      <td style="padding:9px 12px;border:1px solid #F5E8CC;font-size:13px;color:#3D2E14">${val(th,'—')}</td>
      <td style="padding:9px 12px;border:1px solid #F5E8CC;font-size:13px;color:#3D2E14">${val(s,'—')}</td>
    </tr>`;
  }).join('');

  return moduleHeader('3', 'Module 03 · Interview Story Bank', 'Build 6–8 Repeatable Interview Stories') +
    buildStory(1, a, 'm3_s1') +
    buildStory(2, a, 'm3_s2') +
    buildStory(3, a, 'm3_s3') +
    `<div style="margin-top:28px;padding-top:22px;border-top:1.5px dashed #F5A31A">
      <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:12px">Story Bank Inventory</div>
      <table style="width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif">
        <thead><tr style="background:#0D1F3C">
          <th style="padding:10px 12px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A;width:36px">#</th>
          <th style="padding:10px 12px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A">Story Title</th>
          <th style="padding:10px 12px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A">Theme</th>
          <th style="padding:10px 12px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A">One-Line Summary</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>`;
}

function buildModule4(a) {
  const scripts = [
    ['Script A — Short Intro', '10–15 seconds · Cold introductions', a.m4_script_a],
    ['Script B — Medium Intro', '20–30 seconds · Networking events', a.m4_script_b],
    ['Script C — Pivot Intro', '20–25 seconds · When they ask about the change', a.m4_script_c],
  ];
  const followups = [
    ['When they ask "What kind of roles?"', a.m4_follow_roles],
    ['When they ask "Who have you worked with?"', a.m4_follow_with],
    ['When they ask "Why now?"', a.m4_follow_why],
  ];
  return moduleHeader('4', 'Module 04 · Networking &amp; Intro Scripts', 'Sound Confident and Intentional in Every Conversation') +
    scripts.map(([title, meta, value]) => `
    <div style="border:1px solid #F5E8CC;border-left:4px solid #F5A31A;border-radius:0 8px 8px 0;margin-bottom:16px">
      <div style="padding:10px 16px 4px">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#0D1F3C">${title}</div>
        <div style="font-size:10px;color:#7A6240;margin-top:2px">${meta}</div>
      </div>
      <div style="padding:10px 16px 14px;font-size:13px;color:#3D2E14;line-height:1.75;min-height:46px">${val(value)}</div>
    </div>`).join('') +
    `<div style="background:#FDF6EC;border-radius:8px;padding:18px 20px;margin-top:8px">
      <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:14px">My Follow-Up Lines</div>
      ${followups.map(([label, value]) => `
      <div style="margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;color:#0D1F3C;margin-bottom:5px">${label}:</div>
        <div style="background:#fff;border:1px solid #F5E8CC;border-radius:6px;padding:10px 14px;font-size:13px;color:#3D2E14;min-height:36px">${val(value)}</div>
      </div>`).join('')}
    </div></div>`;
}

function buildModule5(a) {
  const scenarios = [
    ['"Why did you leave?"', a.m5_why_left],
    ['"Why the change?"', a.m5_why_change],
    ['"What happened there?"', a.m5_what_happened],
    ['"Is this a step back?"', a.m5_step_back],
  ];
  return moduleHeader('5', 'Module 05 · Transition Talking Points', 'Handle Tough Questions With Confidence') +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">` +
    scenarios.map(([label, value]) => `
    <div style="border:1px solid #F5E8CC;border-radius:8px;overflow:hidden">
      <div style="background:#0D1F3C;padding:11px 15px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff">${label}</div>
      <div style="padding:13px 15px;background:#fff;font-size:13px;color:#3D2E14;line-height:1.7;min-height:70px">${val(value)}</div>
    </div>`).join('') +
    `</div></div>`;
}

function buildClosingPage() {
  return `
  <div style="page-break-before:always;background:#0D1F3C;min-height:400px;padding:64px 52px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#F5A31A;margin-bottom:20px">Story System Complete</div>
    <div style="font-family:'DM Serif Display',serif;font-size:36px;color:#FDF6EC;line-height:1.15;margin-bottom:16px">Your Story Is Your<br><span style="color:#F5A31A">Competitive Edge</span></div>
    <div style="width:40px;height:2px;background:#F5A31A;border-radius:2px;margin-bottom:24px"></div>
    <p style="font-size:14px;color:rgba(253,246,236,.7);line-height:1.75;max-width:480px;margin-bottom:40px">You came in with a pivot that was hard to explain. You're leaving with a complete communication system — a narrative that is grounded, intentional, and forward-facing across every channel.</p>
    <div style="background:rgba(245,163,26,.1);border:1.5px solid rgba(245,163,26,.3);border-radius:12px;padding:28px 32px;max-width:440px;width:100%">
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F5A31A;margin-bottom:8px">Ready to Go Further?</div>
      <div style="font-family:'DM Serif Display',serif;font-size:20px;color:#FDF6EC;margin-bottom:10px">Book a 30-Minute Call</div>
      <p style="font-size:13px;color:rgba(253,246,236,.65);line-height:1.65;margin-bottom:18px">Talk through your story, get unstuck, and leave with clarity on your next move.</p>
      <a href="${CALENDLY}" style="display:inline-block;padding:12px 28px;background:#F5A31A;color:#0D1F3C;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:800;border-radius:32px;text-decoration:none">Schedule a Call with Andrew →</a>
    </div>
    <div style="margin-top:32px;font-size:11px;color:rgba(253,246,236,.3)">© 2026 Project Future Self &nbsp;·&nbsp; projectfutureself.com &nbsp;·&nbsp; REINVENT. REDESIGN. RECLAIM.</div>
  </div>`;
}

function buildReportHTML(name, answers, date) {
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#FDF6EC;color:#1A1208;-webkit-print-color-adjust:exact;print-color-adjust:exact}
</style>
</head><body>
${buildCoverPage(name, date)}
${buildModule1(answers)}
${buildModule2(answers)}
${buildModule3(answers)}
${buildModule4(answers)}
${buildModule5(answers)}
${buildClosingPage()}
</body></html>`;
}

// ── USER EMAIL HTML ──────────────────────────────────────────────────────────

function buildUserEmail(name, email) {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}</style></head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

  <!-- Header -->
  <tr><td style="background:#0D1F3C;border-radius:12px 12px 0 0;padding:28px 36px">
    <div style="font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5A31A;margin-bottom:6px">PROJECT FUTURE SELF</div>
    <div style="font-size:20px;font-weight:800;color:#FDF6EC">Reinvention Story Pack</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #F5E8CC;border-right:1px solid #F5E8CC">
    <p style="font-size:16px;color:#0D1F3C;margin-bottom:20px">Hi ${esc(firstName)},</p>
    <p style="font-size:15px;color:#3D2E14;line-height:1.75;margin-bottom:20px">Your Reinvention Story Pack workbook is attached as a PDF — all five modules, fully compiled from your answers.</p>
    <p style="font-size:15px;color:#3D2E14;line-height:1.75;margin-bottom:28px">The real value comes from reading your own words back to yourself in interviews, networking conversations, and moments when you need to remember why you made this change.</p>

    <div style="background:#FDF6EC;border-radius:8px;padding:20px 22px;margin-bottom:28px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C07D0A;margin-bottom:12px">Two Things to Do Right Now</div>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <div style="width:22px;height:22px;border-radius:50%;background:#0D1F3C;color:#F5A31A;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
        <p style="font-size:14px;color:#3D2E14;line-height:1.65;margin:0"><strong>Read Module 1 out loud.</strong> Your Before / After Story sounds different spoken than written — notice what feels true.</p>
      </div>
      <div style="display:flex;gap:10px">
        <div style="width:22px;height:22px;border-radius:50%;background:#0D1F3C;color:#F5A31A;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
        <p style="font-size:14px;color:#3D2E14;line-height:1.65;margin:0"><strong>Pull up Module 3 before your next interview.</strong> Practice delivering Story 1 in under 2 minutes without notes.</p>
      </div>
    </div>

    <div style="background:#0D1F3C;border-radius:10px;padding:24px 28px;text-align:center;margin-bottom:28px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#F5A31A;margin-bottom:8px">Want to work through this together?</div>
      <div style="font-size:18px;font-weight:700;color:#FDF6EC;margin-bottom:8px">Book a 30-Minute Call with Andrew</div>
      <p style="font-size:13px;color:rgba(253,246,236,.7);line-height:1.65;margin-bottom:18px">Talk through your story, get unstuck, and leave with clarity on your next move.</p>
      <a href="${CALENDLY}" style="display:inline-block;padding:12px 28px;background:#F5A31A;color:#0D1F3C;font-weight:800;font-size:13px;border-radius:32px;text-decoration:none">Schedule a Call →</a>
    </div>

    <p style="font-size:14px;color:#3D2E14;line-height:1.75;margin-bottom:6px">— Andrew</p>
    <p style="font-size:13px;color:#7A6240">Project Future Self</p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0D1F3C;border-radius:0 0 12px 12px;padding:18px 36px;text-align:center">
    <p style="font-size:11px;color:rgba(253,246,236,.35);margin-bottom:4px">Project Future Self &nbsp;·&nbsp; <a href="https://projectfutureself.com" style="color:rgba(253,246,236,.35);text-decoration:none">projectfutureself.com</a></p>
    <p style="font-size:10px;color:rgba(253,246,236,.2)">For support, email <a href="mailto:support@projectfutureself.com" style="color:rgba(253,246,236,.3)">support@projectfutureself.com</a></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

// ── ANDREW NOTIFICATION EMAIL ────────────────────────────────────────────────

function buildAndrewEmail(name, email, date, answers) {
  const preview = (key, len = 80) => {
    const v = answers[key];
    if (!v || !v.trim()) return '<em style="color:#999">Not completed</em>';
    const t = v.trim();
    return esc(t.length > len ? t.slice(0, len) + '…' : t);
  };
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f5f0e8;margin:0;padding:24px">
<div style="max-width:560px;background:#fff;border-radius:10px;padding:32px;border:1px solid #F5E8CC">
  <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C07D0A;margin-bottom:6px">Project Future Self — New Submission</div>
  <h2 style="font-size:20px;color:#0D1F3C;margin-bottom:20px">Reinvention Story Pack Workbook</h2>
  <table style="width:100%;font-size:14px;color:#3D2E14;margin-bottom:24px">
    <tr><td style="padding:6px 0;font-weight:700;width:100px">Name:</td><td>${esc(name)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:700">Email:</td><td><a href="mailto:${esc(email)}" style="color:#0D1F3C">${esc(email)}</a></td></tr>
    <tr><td style="padding:6px 0;font-weight:700">Date:</td><td>${date}</td></tr>
  </table>
  <div style="border-top:1px solid #F5E8CC;padding-top:18px;margin-bottom:8px">
    <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C07D0A;margin-bottom:14px">Module Previews</div>
    <p style="font-size:13px;margin-bottom:4px"><strong>M1 Final Assembly:</strong> ${preview('m1_final')}</p>
    <p style="font-size:13px;margin-bottom:4px"><strong>M2 Interview Version:</strong> ${preview('m2_interview')}</p>
    <p style="font-size:13px;margin-bottom:16px"><strong>M4 Script A:</strong> ${preview('m4_script_a')}</p>
  </div>
  <p style="font-size:13px;color:#7A6240">Full workbook PDF is attached. Reply to this email to respond directly to ${esc(name.split(' ')[0])}.</p>
</div>
</body></html>`;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function onRequestPost({ request, env, waitUntil }) {
  // 1. Parse request
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

  if (!env.VERCEL_PDF_URL) {
    return new Response(JSON.stringify({ error: 'PDF service not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, answers = {} } = data;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const filename = `${name.replace(/\s+/g, '-')}-reinvention-story-pack.pdf`;

  // 2–5. PDF generation + emails run in background so we can return 200 immediately.
  // Railway PDF rendering (with font loading) can take 15–30 s — exceeds CF sync timeout.
  const pdfUrl = env.VERCEL_PDF_URL.replace(/\/api\/generate-pdf$/, '') + '/api/generate-pdf-from-html';

  waitUntil((async () => {
    try {
      // Build PDF
      const htmlReport = buildReportHTML(name, answers, date);
      const pdfRes = await fetch(pdfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlReport, name }),
      });
      if (!pdfRes.ok) {
        const err = await pdfRes.text().catch(() => 'unknown');
        throw new Error(`Railway PDF ${pdfRes.status}: ${err}`);
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
      const userEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Project Future Self <info@projectfutureself.com>',
          to: [email],
          bcc: ['info@projectfutureself.com'],
          subject: `Your Reinvention Story Pack — ${name.split(' ')[0]}, your results`,
          html: buildUserEmail(name, email),
          attachments: [{ filename, content: pdfBase64 }],
        }),
      });
      if (!userEmailRes.ok) {
        const err = await userEmailRes.text().catch(() => 'unknown');
        console.error('[story-pack] User email failed:', userEmailRes.status, err);
      }

      // Send Andrew notification
      const andrewEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Project Future Self <info@projectfutureself.com>',
          to: ['andrew@projectfutureself.com'],
          reply_to: email,
          subject: `New Workbook: ${name} — Reinvention Story Pack (${date})`,
          html: buildAndrewEmail(name, email, date, answers),
          attachments: [{ filename, content: pdfBase64 }],
        }),
      });
      if (!andrewEmailRes.ok) {
        const err = await andrewEmailRes.text().catch(() => 'unknown');
        console.error('[story-pack] Andrew email failed:', andrewEmailRes.status, err);
      }

      // Log to Google Sheets (fire-and-forget)
      if (env.SHEETS_WEBHOOK_URL) {
        fetch(env.SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'story_pack', name, email, date }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('[story-pack] Background task failed:', e);
    }
  })());

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
