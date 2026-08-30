---
name: meridian-api
description: Connect to the Meridian platform via API key — create an mrd_ key, authenticate with Bearer token, handle rate limits and errors. Use when setting up API access, storing keys, or making your first authenticated call.
---

# Meridian API — Connect with Your API Key

Use this when you want an AI assistant or script to act on your Meridian account via the API.

## Get an API key

1. Sign in to Meridian (https://meridian.silkdev.com.tn) → **Settings → API Keys** (or `POST /api/auth/api-key/create` if you already have a session).
2. Click **Create key**, give it a name (e.g. `assistant`, `n8n`, `zapier`). The key is shown once, prefixed `mrd_`.
3. Copy it immediately — it will not be shown again. Store it in your password manager or env var (`MERIDIAN_API_KEY`), never in git.

Better Auth config: `requireName: true`, `defaultPrefix: "mrd_"`, `rateLimitEnabled: true` (see `meridian/src/lib/auth.ts`). Keys can have `expiresAt`, `remaining` quota, and per-key rate limits.

## Authenticate

Every API call uses the same header:

```
Authorization: Bearer mrd_xxxxxxxxxxxxxxxx
Content-Type: application/json
```

Base URL: `https://meridian.silkdev.com.tn` (or `http://localhost:3000` for local dev). All examples below assume `MERIDIAN_API_URL` + `MERIDIAN_API_KEY` in your env.

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     "$MERIDIAN_API_URL/api/services" | jq
```

With the MCP server (`meridian-mcp`), set `MERIDIAN_API_URL` + `MERIDIAN_API_KEY` in its env — tools then work without per-call headers.

## Rate limits & errors

- Keys are rate-limited (`rateLimitEnabled`, `rateLimitMax`/`rateLimitTimeWindow`). On `429`, back off and retry after the `Retry-After` header.
- `401` = missing/invalid/expired key or wrong prefix. Re-create the key in settings.
- `403` = key valid but not authorized for that resource (e.g. provider-only endpoint with a customer key).
- `remaining` / `requestCount` / `lastRequest` on the `ApiKey` model let you audit usage.

## Rotate / revoke

- **Rotate**: create a new key, update your env/automation, then delete the old one (`DELETE /api/auth/api-key/delete` or settings UI).
- **Revoke**: delete the key — all further calls with it return `401`. No propagation delay.

## Quick check

```bash
# should return your services, not 401
curl -s -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/services?country=TN" | head -c 500
```

If this returns JSON, your assistant is connected. Use `/skill:meridian-services` next to browse the catalog.
