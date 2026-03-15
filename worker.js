// worker.js
const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
const resend = require('resend')(env.RESEND_API_KEY);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle Stripe webhook
    if (url.pathname === '/api/stripe-webhook') {
      const stripeSignature = request.headers.get('stripe-signature');
      
      if (stripeSignature) {
        try {
          const event = stripe.webhooks.constructEvent(
            await request.text(),
            stripeSignature,
            env.STRIPE_WEBHOOK_SECRET
          );
          
          console.log(`Received Stripe event: ${event.type}`);
          
          // Handle the event here
          
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(`Webhook Error: ${error.message}`, {
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      
      return new Response('No stripe-signature header', { status: 400 });
    }
    
    // Handle Resend API calls
    if (url.pathname === '/api/send-email') {
      try {
        const data = await request.json();
        const result = await resend.emails.send(data);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
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
