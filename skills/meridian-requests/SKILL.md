---
name: meridian-requests
description: Create and track Meridian service requests via API — submit a request, check status through the workflow phases, chat with the team, and upload required documents. Use when requesting a service or following up on an existing request.
---

# Meridian Requests — Create & Track Your Requests

Requires `Authorization: Bearer mrd_…` (see `/skill:meridian-api`). This is the user-facing request lifecycle — you are the customer.

## Create a request

Pick a service first (`/skill:meridian-services`). Then:

```bash
curl -X POST -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"serviceId":"<slug-or-id>","answers":{"companyName":"Acme SARL","activity":"Consulting"},"variantKey":"standard"}' \
     "$MERIDIAN_API_URL/api/requests" | jq
# custom (no catalog service fits):
# -d '{"customTitle":"Translate 10 pages EN→FR","answers":{"details":"..."}}'
```

MCP: `create_service_request({ serviceId, answers, customTitle })`. The response includes the new `id`, `status` (`REQUIREMENTS` at first), and `currentStepId`.

Answers must match the service's `formConfig` — validate field names/required flags from `GET /api/services/<id>` before submitting.

## Track status

Requests move through phases, visible as chat status and via API:

```
REQUIREMENTS → ADMIN_VALIDATION → PROVIDER_ACCEPTANCE → QUOTE → PAYMENT → DELIVERY → FULFILLMENT → COMPLETED
(branches: PROVIDER_DECLINED, RESHOP_REQUESTED, DISPUTED  |  terminals: CANCELLED, REJECTED)
```

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/requests/<id>" | jq '{status, title}'
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/requests/<id>/steps" | jq
# or MCP: get_service_request({ id }), get_workflow_status({ requestId }), list_request_steps({ requestId })
```

`list_request_steps` returns every `RequestStep` in order with `status` (`PENDING`/`IN_PROGRESS`/`COMPLETED`). The current step is `IN_PROGRESS`.

## Chat & documents

The chat is the request surface — messages and typed action cards live at:

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/requests/<id>/messages" | jq
```

- Required documents appear as `documentRequest` cards (with `requirementId`, `documentName`, `allowedFormats`, `status`). Upload via the messages API or the Documents tab — the card flips to `FULFILLED` once the file is attached.
- Some services have a details form — fill it from the `formConfig` check above.
- When a quote is ready you will see a `quoteGenerated` card (see `/skill:meridian-payments`).

## List your requests

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/requests?limit=20" | jq
# filter: ?status=PAYMENT  or  ?status=COMPLETED
# MCP: list_service_requests({ status, limit })
```

Tip for assistants: after creating a request, proactively show the user its status and what they need to do next (usually: “upload X documents” or “wait for admin review”).
