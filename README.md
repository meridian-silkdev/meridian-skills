# @meridiantoolkit/skills

Agent skills for the **Meridian** platform — user-facing skills for customers using Meridian through an API key (`mrd_`). Same `SKILL.md` files work as a [pi Agent Skill](https://agentskills.io) package or a Claude Code plugin (`.claude-plugin/plugin.json` included) — no code, so nothing to port. Codex CLI has no skills concept; Codex users get the same coverage through the `meridian` MCP server's tool descriptions instead (see `meridian-mcp`).

## Skills

| Skill | Trigger |
|-------|---------|
| `meridian-api` | API key, connect, authenticate, Bearer token, rate limits |
| `meridian-services` | browse services, categories, requirements, form fields |
| `meridian-requests` | create request, track status, chat, upload documents |
| `meridian-payments` | quote, pay — Flouci (Tunisia, local) or Stripe (international), verify |
| `meridian-meetings` | list/create meetings, RSVP, Teams join link |

All skills assume `Authorization: Bearer mrd_…` and `MERIDIAN_API_URL`. See `meridian-api` first to connect.

## Install

**pi:**

```bash
pi install ./meridian-skills          # project-local
pi install /absolute/path/to/meridian-skills  # global
# or via npm after publish
pi install npm:@meridiantoolkit/skills
```

Or add to `.pi/settings.json`:

```json
{ "skills": ["/absolute/path/to/meridian-skills/skills"] }
```

**Claude Code:**

```
/plugin marketplace add meridian-silkdev/meridian-plugin
/plugin install meridian-skills@meridian
```

## Usage

Invocation syntax differs by host — the skill names themselves don't:

| Skill | pi | Claude Code |
|-------|----|----|
| `meridian-api` | `/skill:meridian-api` | `/meridian-api` |
| `meridian-services` | `/skill:meridian-services` | `/meridian-services` |
| `meridian-requests` | `/skill:meridian-requests` | `/meridian-requests` |
| `meridian-payments` | `/skill:meridian-payments` | `/meridian-payments` |
| `meridian-meetings` | `/skill:meridian-meetings` | `/meridian-meetings` |

Either host can also load a skill automatically when its `description` matches what you're asking for — you don't have to type the slash form.
