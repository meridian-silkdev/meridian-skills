---
name: meridian-meetings
description: Manage Meridian meetings via API — list meetings for a request, create a Teams meeting, and RSVP. Use when scheduling a call with the admin/provider or responding to an invite.
---

# Meridian Meetings — Schedule & Respond

Requires `Authorization: Bearer mrd_…` (see `meridian-api`). Meetings are Teams meetings created via Microsoft Graph by a single organizer account — guests join via `joinWebUrl`, no Microsoft account needed.

## List meetings

```bash
curl -H "Authorization: Bearer $MERIDIAN_API_KEY" \
  "$MERIDIAN_API_URL/api/meetings?serviceRequestId=<id>" | jq
# filter: ?status=SCHEDULED
# MCP: list_meetings({ serviceRequestId, status })
```

Each meeting has `title`, `scheduledAt` (ISO), `duration` (minutes), `status` (`SCHEDULED`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`), `startUrl`/`joinWebUrl`, `teamsMeetingId`, and per-invitee responses (`customerResponse`, `providerResponse`, `adminResponse` as `PENDING`/`ACCEPTED`/`DECLINED`).

## Create a meeting

Pick a fixed time and who to invite (customer, provider, or both):

```bash
curl -X POST -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"title":"Kick-off","scheduledAt":"2026-09-01T10:00:00Z","duration":30,"serviceRequestId":"<id>","inviteCustomer":true,"inviteProvider":true}' \
     "$MERIDIAN_API_URL/api/meetings" | jq
# MCP: create_meeting({ title, scheduledAt, duration, serviceRequestId, inviteCustomer, inviteProvider })
```

The meeting and Teams invite go out immediately — no proposal/selection step.

## RSVP

Accept or decline your invite — declining records your answer but does **not** cancel the meeting:

```bash
curl -X PATCH -H "Authorization: Bearer $MERIDIAN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"response":"ACCEPTED"}' \
     "$MERIDIAN_API_URL/api/meetings/<meetingId>/response" | jq
# response: ACCEPTED | DECLINED | PENDING
# MCP: respond_to_meeting({ meetingId, response })
```

Show the user the `joinWebUrl`/`startUrl` for joining and remind them of the time in their timezone.
