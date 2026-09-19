# Revenue bridge wiring

The VCL Stripe webhook verifies the Stripe signature before handling monetized events.

When configured, it forwards:
- checkout.session.completed
- payment_intent.succeeded
- invoice.paid
- charge.succeeded

Set these deployment environment variables on the VCL runtime:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- REVENUE_BRIDGE_URL
- REVENUE_BRIDGE_TOKEN (optional shared bearer token)

The revenue bridge must treat only verified events received from this webhook as observed payment events. Checkout URLs, page views, proposals, and GitHub activity are not revenue.

Do not put Stripe secrets in source control.
