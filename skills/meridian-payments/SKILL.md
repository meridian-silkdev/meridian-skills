---
name: meridian-payments
description: Pay for Meridian quotes — Flouci for Tunisia (local wallet/card) or Stripe for international (cards), verify payment server-side, and handle wire/check fallback. Use when a quote is ready, you need to pay, or you want to confirm a payment went through.
---

# Meridian Payments — Pay Your Quote

You have a request at `QUOTE` or `PAYMENT` (see `/skill:meridian-requests`). This skill covers the user-facing payment choices.

## Choice: Flouci (Tunisia, local) vs Stripe (international)

- **Flouci** — Tunisia-licensed gateway (`FLOUCI_PUBLIC_TOKEN`/`FLOUCI_PRIVATE_TOKEN` on the platform). Use when paying **in Tunisia**: checkout offers Tunisian wallet and local bank card. Amounts are in **TND** (dinars, including millimes). Meridian never sees card details — you are redirected to Flouci's hosted checkout, then back to `?paymentId=…`.
- **Stripe** — Use when paying **internationally** (outside Tunisia) or with an international card. Standard Stripe Checkout / PaymentIntent (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). Cards, Apple Pay, etc. Handles multiple currencies as configured.

Your `PAYMENT` step's Pay card will offer the method appropriate to your service/country. If both are configured, choose the one that matches your billing location.

API — create a payment intent (the platform decides the provider, or you can pass `provider` if offered):

```bash
curl -X POST -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"serviceRequestId":"<id>"}' \
     "$MERIDIAN_API_URL/api/payments/create-intent" | jq
# response: { provider: "FLOUCI", redirectUrl: "https://..." } or { provider: "STRIPE", clientSecret: "pi_..." }
```

MCP: `get_payment_status({ requestId })` to see the current `Payment` row (`amount`, `status` PENDING/SUCCEEDED/FAILED, `provider`).

## Verify — never trust redirect alone

A redirect back to the portal is **not** proof of payment. Always verify server-side:

```bash
curl -X POST -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     -d '{"paymentId":"<paymentId>"}' \
     "$MERIDIAN_API_URL/api/requests/<id>/payment/verify" | jq
# MCP: verify_payment({ requestId, paymentId })
```

Only `status: SUCCEEDED` after verification means the request advances to `DELIVERY`. Webhooks help, but the UI's “payment completed” check must also call verify — webhooks can be delayed or missed.

## Wire / check (manual)

Where the provider offers it, you can pay by bank wire or check. The provider/admin marks it paid manually in the admin panel (`POST /api/requests/:id/payment/confirm-manual`). The request advances the same way.

## Testing

- **Flouci sandbox**: same API, test mode is toggled by using the “Test APP” tokens — small amount like 1000 millimes (1 TND), complete the hosted page, then verify and assert the DB row.
- **Stripe test**: card `4242 4242 4242 4242`, `pm_card_visa` — same verify flow.

Never commit real tokens — keep them in env.
