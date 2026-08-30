---
name: meridian-services
description: Browse the Meridian service catalog via API — list categories, search services, inspect requirements and form fields. Use when finding a service to request, comparing options, or checking what documents a service needs.
---

# Meridian Services — Browse the Catalog

You have an API key (see `/skill:meridian-api`). This skill helps you find the right service to request.

## List categories

Categories group services by domain and country (`countryCode` default `TN`).

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/categories" | jq '.[].slug'
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/services?country=TN" | jq
```

MCP: `list_categories`, `list_services({ countryCode: "TN", isActive: true })`.

## Inspect a service

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/services/<slug-or-id>" | jq
# or MCP: get_service({ idOrSlug: "company-incorporation" })
```

Key fields to show the user:

- `title` / `description` — what the service delivers
- `deliverables` — comma-joined delivery steps
- `timeline` / `estimatedDays` — expected duration (“a few days” if null)
- `documentRequirements[]` — `{ documentName, description, allowedFormats }` — what they must upload
- `formConfig` — dynamic form sections/variants (fields: `text`/`textarea`/`select`/`checkbox`/`file`). If `variants` exist, the user must pick one (`standard`, `premium`, etc.) — each variant has its own fields.
- `currency` — `TND` for Tunisia services; consult the service for other locales

## Help the user choose

- If they describe a need in plain language (“I need a company in Tunisia”), search services for similar titles/descriptions and suggest the closest match.
- Summarize requirements clearly: “This service needs X documents (Y format) and Z form fields. Estimated: N days.”
- If no catalog service fits, they can still create a custom request with `customTitle` (see `/skill:meridian-requests`).

## Filter tips

- `GET /api/services?category=<slug>` — narrow to a category
- `?country=TN` — required for Tunisia; other codes for other markets
- Only `isActive: true` services are orderable
