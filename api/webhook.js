// api/webhook.js — Stripe webhook: on successful payment
export const config = { api: { bodyParser: false } };
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function forwardRevenueEvent(event) {
  const url = process.env.REVENUE_BRIDGE_URL;
  const token = process.env.REVENUE_BRIDGE_TOKEN;
  if (!url) return { forwarded: false, reason: 'REVENUE_BRIDGE_URL not configured' };

  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Revenue bridge returned HTTP ${response.status}`);
  }
  return { forwarded: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const monetizedEvents = new Set([
    'checkout.session.completed',
    'payment_intent.succeeded',
    'invoice.paid',
    'charge.succeeded',
  ]);

  if (monetizedEvents.has(event.type)) {
    try {
      const forwarded = await forwardRevenueEvent(event);
      console.log(JSON.stringify({
        type: 'payment_observed',
        stripe_event_id: event.id,
        event_type: event.type,
        forwarded: forwarded.forwarded,
      }));
    } catch (err) {
      console.error(JSON.stringify({
        type: 'revenue_forward_error',
        stripe_event_id: event.id,
        error: err.message,
      }));
      return res.status(502).json({
        received: true,
        revenue_forwarded: false,
        error: 'Revenue event could not be forwarded',
      });
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { artifact_id, tier } = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    const licenseToken = `evez-${tier || 'purchase'}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    console.log(JSON.stringify({
      type: 'license_issued',
      licenseToken,
      artifact_id,
      tier,
      customerEmail,
    }));
  }

  res.status(200).json({ received: true });
}
