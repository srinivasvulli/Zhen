import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel.');
  return new Stripe(key);
}
