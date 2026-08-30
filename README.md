# meridian-skills

Pi [Agent Skills](https://agentskills.io) for the **Meridian** platform — user-facing skills for customers using Meridian through an API key (`mrd_`).

## Skills

| Skill | Trigger |
|-------|---------|
| `meridian-api` | API key, connect, authenticate, Bearer token, rate limits |
| `meridian-services` | browse services, categories, requirements, form fields |
| `meridian-requests` | create request, track status, chat, upload documents |
| `meridian-payments` | quote, pay — Flouci (Tunisia, local) or Stripe (international), verify |
| `meridian-meetings` | list/create meetings, RSVP, Teams join link |

All skills assume `Authorization: Bearer mrd_…` and `MERIDIAN_API_URL`. See `/skill:meridian-api` first to connect.

## Install

```bash
pi install ./meridian-skills          # project-local
pi install /absolute/path/to/meridian-skills  # global
# or via npm after publish
pi install npm:meridian-skills
```

Or add to `.pi/settings.json`:

```json
{ "skills": ["/absolute/path/to/meridian-skills/skills"] }
```

## Usage

```
/skill:meridian-api          # get connected with your mrd_ key
/skill:meridian-services     # find the right service
/skill:meridian-requests     # create & track a request
/skill:meridian-payments     # pay a quote (Flouci Tunisia / Stripe international)
/skill:meridian-meetings     # schedule or respond to a meeting
```
