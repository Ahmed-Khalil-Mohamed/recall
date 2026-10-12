# Recall HTTP API

Base: `/api`. JSON mutation requests require `X-Requested-With: recall`. The application-specific HttpOnly cookie authenticates browser requests.

| Method | Path                         | Request / purpose                                   |
| ------ | ---------------------------- | --------------------------------------------------- |
| GET    | `/health`                    | Process health                                      |
| POST   | `/auth/register`             | `{name,email,password}`; password 12–128 characters |
| POST   | `/auth/login`                | `{email,password}`                                  |
| POST   | `/auth/demo`                 | Create an isolated fictional workspace              |
| POST   | `/auth/logout`               | Revoke the session                                  |
| GET    | `/me`                        | Current account                                     |
| GET    | `/recall/entries`            | Owner-scoped records                                |
| POST   | `/recall/entries`            | Input validated by the domain schema                |
| PATCH  | `/recall/entries/:id`        | `{version,input}`; safe description edits           |
| POST   | `/recall/entries/:id/action` | `{version,action,payload}`                          |
| DELETE | `/recall/entries/:id`        | `{version}`; retain deletion activity               |
| GET    | `/recall/events`             | Most recent 100 activity events                     |
| POST   | `/recall/seed`               | Populate an empty workspace with fictional data     |

Input schemas and actions are defined in `apps/recall/domain.ts`. Edit fields are in `src/editing.ts`. Other application IDs return 404.

Errors use `{"error":"machine_code"}`: 400 invalid input or transition; 401 unauthenticated; 403 origin or disabled operation; 404 missing/inaccessible record; 409 stale version; 429 rate limit. Record envelopes include `id`, `version`, `createdAt`, `updatedAt` and `data`. No HTTP route accepts a filesystem path.
