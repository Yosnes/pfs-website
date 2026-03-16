const PAGE_STYLES = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #FDF6EC; color: #1A1208; min-height: 100vh; display: flex; flex-direction: column; }
    nav { background: rgba(253,246,236,0.97); border-bottom: 1px solid rgba(13,31,60,0.08); padding: 0 5%; }
    .nav-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; height: 72px; }
    .nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .nav-wordmark { line-height: 1.15; }
    .nav-wordmark .nw-top { font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #7A6240; }
    .nav-wordmark .nw-main { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; color: #0D1F3C; text-transform: uppercase; }
    .nav-wordmark .nw-tag { font-size: 7px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #C07D0A; }
    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 60px 5%; }
    .card { background: #fff; border: 1.5px solid #F5E8CC; border-radius: 16px; padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 4px 32px rgba(13,31,60,0.07); }
    .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #F5A31A; margin-bottom: 12px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400; color: #0D1F3C; line-height: 1.15; margin-bottom: 16px; }
    p { font-size: 15px; color: #3D2E14; line-height: 1.7; margin-bottom: 28px; }
    .btn { display: inline-block; padding: 12px 28px; background: #F5A31A; color: #0D1F3C; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none; border-radius: 24px; transition: background 0.2s; }
    .btn:hover { background: #f8b83a; }
    footer { background: #060F1E; padding: 24px 5%; text-align: center; }
    footer p { font-size: 11px; color: rgba(253,246,236,0.3); }
  </style>
`;

function errorPage(statusCode, eyebrow, heading, body) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${heading} — Project Future Self</title>
${PAGE_STYLES}
</head>
<body>
<nav>
  <div class="nav-inner">
    <a href="/index.html" class="nav-brand">
      <div class="nav-wordmark">
        <div class="nw-top">Project</div>
        <div class="nw-main">Future Self</div>
        <div class="nw-tag">Reinvent · Redesign · Reclaim</div>
      </div>
    </a>
  </div>
</nav>
<main>
  <div class="card">
    <div class="eyebrow">${eyebrow}</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a href="/products.html" class="btn">Browse Products →</a>
  </div>
</main>
<footer><p>© 2025 Project Future Self. All rights reserved.</p></footer>
</body>
</html>`,
    {
      status: statusCode,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    }
  );
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  console.log('[download] token:', token);
  console.log('[download] DOWNLOAD_TOKENS binding present:', !!env.DOWNLOAD_TOKENS);
  console.log('[download] PRODUCTS_BUCKET binding present:', !!env.PRODUCTS_BUCKET);

  if (!token) {
    return errorPage(
      400,
      'Invalid Request',
      'No Token Provided',
      'This download link is missing a token. Please use the link sent to your email.'
    );
  }

  const raw = await env.DOWNLOAD_TOKENS.get(token);

  if (!raw) {
    return errorPage(
      404,
      'Link Not Found',
      'Link Expired or Invalid',
      'This download link has expired or is no longer valid. Download links are active for 24 hours. If you need help, contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a>.'
    );
  }

  let tokenData;
  try {
    tokenData = JSON.parse(raw);
  } catch {
    return errorPage(
      500,
      'Error',
      'Something Went Wrong',
      'There was an error processing your download. Please contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a> for assistance.'
    );
  }

  if (Date.now() > tokenData.expiresAt) {
    return errorPage(
      410,
      'Link Expired',
      'This Link Has Expired',
      'Your download link was valid for 24 hours and has now expired. Please contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a> if you need a new link.'
    );
  }

  if (tokenData.downloads >= tokenData.maxDownloads) {
    return errorPage(
      410,
      'Download Limit Reached',
      'Download Limit Reached',
      `You have already downloaded this file ${tokenData.maxDownloads} times, which is the maximum allowed. If you need additional access, contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a>.`
    );
  }

  // Fetch from R2
  console.log('[download] fetching from R2:', tokenData.file);
  const object = await env.PRODUCTS_BUCKET.get(tokenData.file);

  if (!object) {
    console.error('R2 object not found:', tokenData.file);
    return errorPage(
      404,
      'File Not Found',
      'File Unavailable',
      'We could not find your file. Please contact <a href="mailto:support@projectfutureself.com" style="color:#C07D0A;">support@projectfutureself.com</a> and we\'ll get it to you right away.'
    );
  }

  // Increment download count, preserve remaining TTL
  const remainingMs = tokenData.expiresAt - Date.now();
  const remainingTtlSeconds = Math.max(1, Math.floor(remainingMs / 1000));

  const updatedData = { ...tokenData, downloads: tokenData.downloads + 1 };
  await env.DOWNLOAD_TOKENS.put(token, JSON.stringify(updatedData), {
    expirationTtl: remainingTtlSeconds,
  });

  const safeFilename = tokenData.file.replace(/[^a-zA-Z0-9.\-_ ]/g, '_');

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
