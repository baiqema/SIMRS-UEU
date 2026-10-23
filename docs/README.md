# SIMRS Esa Unggul documentation

SIMRS Esa Unggul is a teaching hospital information system for the Rekam Medis dan Informasi Kesehatan (RMIK) programme at Universitas Esa Unggul. Every patient, visit and claim in it is simulated.

## Product and system documentation

The documents below were written from the code on `main` (commit `c768230`, October 2026). They describe what the system does today. Where the code leaves a goal or rule unclear, the text says it is inferred, and those points should be confirmed by the product owner (Ema) before they are treated as requirements.

| Document | What it answers |
| --- | --- |
| [Product requirements (PRD)](product/01-prd.md) | Why the system exists, for whom, scope, goals, constraints, open issues |
| [Users, roles and access](product/02-users-and-roles.md) | Personas, account types, the 14 practice roles, the access matrix |
| [Functional requirements](product/03-functional-requirements.md) | What each module must do, numbered per module |
| [Architecture](product/04-architecture.md) | Components, running modes, request flow, security model, deployment |
| [Data model](product/05-data-model.md) | Tables, relations (ERD), JSON record shapes, audit log |
| [API reference](product/06-api-reference.md) | Every `/api` endpoint with request, response and errors |

## Operations

| Document | Audience |
| --- | --- |
| [Installing on the campus server](operations/campus-deployment.md) | IT unit |
| [Development](operations/development.md) | Developers |
| [Demo walkthrough](operations/demo-walkthrough.md) | Demo presenters |
| [Setup checklist](operations/setup-checklist.md) | Ema, Daniel, IT unit |
| [GitHub → GitLab sync](operations/gitlab-sync.md) | Daniel, IT unit |

## Historical

`superpowers/specs/` and `superpowers/plans/` hold the October 2026 design and plan for a Supabase backend. That design was replaced by the Node.js API on plain PostgreSQL described in [Architecture](product/04-architecture.md). The role, class and audit concepts carried over, but the Supabase-specific parts (Supabase Auth, Edge Functions, Realtime) no longer apply.

## Keeping these documents current

- A change that adds or removes a screen, role, table or endpoint should update the matching document in the same pull request.
- Module and page ids (`pendaftaran`, `coding`, ...) are the ids used in code and in `practice_roles.access`; keep them identical here.
