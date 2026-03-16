const PRODUCTS = {
  price_1TBLphF8dcdrC71Hh95PYFLH: { file: 'Reinvention Story Pack-FINAL.pdf',         name: 'Reinvention Story Pack' },
  price_1TBLoPF8dcdrC71H0sFah9go: { file: 'Skill Monetization Toolkit-FINAL.pdf',      name: 'Skill Monetization Toolkit' },
  price_1TBLnHF8dcdrC71H43YBOyUk: { file: 'Confidence Reset Protocol-FINAL.pdf',       name: 'Confidence Reset Protocol' },
  price_1TBLmXF8dcdrC71H9I5HIjjh: { file: 'Personal Brand Starter Kit-FINAL.pdf',      name: 'Personal Brand Starter Kit' },
  price_1TBLltF8dcdrC71H687JYbtZ: { file: 'Job Search Accelerator System-FINAL.pdf',   name: 'Job Search Accelerator System' },
  price_1TBLkkF8dcdrC71Hka3eGZIb: { file: 'Career Pivot Playbook-FINAL.pdf',           name: 'Career Pivot Playbook' },
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;

  // Accept ?prices=id1,id2,id3 (cart) or legacy ?price=id (single)
  const raw = url.searchParams.get('prices') || url.searchParams.get('price');

  if (!raw) {
    return new Response('Missing price parameter', { status: 400 });
  }

  const priceIds = raw.split(',').map(p => p.trim()).filter(Boolean);

  for (const priceId of priceIds) {
    if (!PRODUCTS[priceId]) {
      return new Response(`Invalid price ID: ${priceId}`, { status: 400 });
    }
  }

  const params = new URLSearchParams({
    'payment_method_types[]': 'card',
    mode: 'payment',
    success_url: `${origin}/download-success.html`,
    cancel_url: `${origin}/products.html`,
  });

  priceIds.forEach((priceId, i) => {
    params.append(`line_items[${i}][price]`, priceId);
    params.append(`line_items[${i}][quantity]`, '1');
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Stripe error:', error);
    return new Response('Failed to create checkout session', { status: 502 });
  }

  const session = await response.json();
  return Response.redirect(session.url, 303);
}
