---
name: meridian-api
description: Connect to Meridian via API key (mrd_) or Agent Auth — create a key, use Bearer token, or discover via /.well-known/agent-configuration with delegated device-auth/CIBA and capability-scoped JWTs. Use when setting up API or agent access.
---

# Meridian API — Connect with Your API Key or Agent Auth

Use this when you want an AI assistant, script, or autonomous agent to act on your Meridian account.

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

## Agent Auth (AI agents, capability-scoped)

Meridian also exposes **Agent Auth** (`@better-auth/agent-auth`) for AI agents that need scoped, auditable, short-lived access — no long-lived `mrd_` key in the agent's env.

- **Discovery**: `GET /.well-known/agent-configuration` (via `auth.api.getAgentConfiguration()`) — lists issuer, endpoints, `default_location` (execute URL), and capabilities.
- **Capabilities** (narrow, reviewable): `list_services`, `get_service`, `list_categories`, `create_service_request`, `list_service_requests`, `get_service_request`, `get_workflow_status`, `list_request_steps`, `get_payment_status`, `verify_payment`, `list_meetings`, `create_meeting`, `respond_to_meeting`. Reads (`GET`) use `approvalStrength: session`; mutating calls (`verify_payment`, `create_*`) can require stronger verification.
- **Flow**: agent discovers → lists capabilities → registers & requests grants → user approves via **device authorization** or **CIBA** → agent signs short-lived JWTs (`aud` = `default_location` or capability `location`) and calls `POST /capability/execute` (or the capability's own `location`). Server verifies JWT + grant via `auth.api.getAgentSession({ headers })` / `verifyAgentRequest(request, auth)` and runs `onExecute`.
- **Adapters**: OpenAPI (`createFromOpenAPI(spec, { baseUrl, resolveHeaders })`) and MCP are supported — the MCP server can be exposed as agent-auth tools so any MCP-compatible agent can discover and call capabilities.
- **When to use what**: simple automation / personal scripts → `mrd_` API key. Third-party or autonomous AI agents that need least-privilege, revocable, auditable access → Agent Auth with delegated/autonomous modes.
