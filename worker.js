export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Example: Store something in KV
    if (url.pathname === '/api/cache' && request.method === 'POST') {
      const data = await request.json();
      await env.MY_KV.put('cached_data', JSON.stringify(data));
      return new Response('Cached!', { status: 200 });
    }
    
    // Example: Get something from KV
    if (url.pathname === '/api/cache' && request.method === 'GET') {
      const cached = await env.MY_KV.get('cached_data');
      return new Response(cached || 'Nothing cached', { status: 200 });
    }
    
    // Your existing routes...
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
