export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Example: Use KV namespace
    if (url.pathname === '/api/cache' && request.method === 'POST') {
      const data = await request.json();
      await env.DOWNLOAD_TOKENS.put('cached_data', JSON.stringify(data));
      return new Response('Cached!', { status: 200 });
    }
    
    // Example: Use R2 bucket
    if (url.pathname === '/api/products' && request.method === 'GET') {
      const object = await env.PRODUCTS_BUCKET.get('products.json');
      if (object) {
        return new Response(await object.text(), { status: 200 });
      }
      return new Response('Not found', { status: 404 });
    }
    
    // Your existing Stripe webhook handler
    if (url.pathname === '/api/stripe-webhook') {
      const stripeSignature = request.headers.get('stripe-signature');
      
      if (stripeSignature) {
        try {
          const stripe = await import('https://esm.sh/stripe@latest');
          const event = stripe.default.webhooks.constructEvent(
            await request.text(),
            stripeSignature,
            env.STRIPE_WEBHOOK_SECRET
          );
          
          console.log(`Received Stripe event: ${event.type}`);
          
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Stripe webhook error:', error);
          return new Response(`Webhook Error: ${error.message}`, {
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      
      return new Response('No stripe-signature header', { status: 400 });
    }
    
    // Your existing Resend email handler
    if (url.pathname === '/api/send-email' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to send email');
        }
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Resend error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return env.ASSETS.fetch(request);
  }
};
