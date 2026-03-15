// worker.js - Using ES modules
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle Stripe webhook
    if (url.pathname === '/api/stripe-webhook') {
      const stripeSignature = request.headers.get('stripe-signature');
      
      if (stripeSignature) {
        try {
          // Import Stripe SDK dynamically
          const stripe = await import('https://esm.sh/stripe@latest');
          const event = stripe.default.webhooks.constructEvent(
            await request.text(),
            stripeSignature,
            env.STRIPE_WEBHOOK_SECRET
          );
          
          console.log(`Received Stripe event: ${event.type}`);
          
          // Handle the event here
          // Example:
          // switch(event.type) {
          //   case 'checkout.session.completed':
          //     // Handle successful payment
          //     break;
          // }
          
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
    
    // Handle Resend API calls
    if (url.pathname === '/api/send-email' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        // Make direct HTTP request to Resend API
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
    
    // Serve static assets for other routes
    return env.ASSETS.fetch(request);
  }
};
