# Volunteer Planner MVP

Next.js + PostgreSQL-ready MVP for volunteer scheduling across multiple organizations.

## MVP domain model

This project ships the first complete scheduling loop with these entities:

- Organization
- Person
- OrganizationMembership
- Project
- Role
- Shift
- ShiftRequirement
- Assignment
- Availability

Prisma schema is located at `/home/runner/work/volunteer_planner/volunteer_planner/prisma/schema.prisma` and is configured for PostgreSQL via `DATABASE_URL`.

## Screens included

- Dashboard (`/`)
- Projects (`/projects`)
- Project Detail (`/projects/[projectId]`)
- Schedule (`/schedule`)
- Shift Detail (`/shifts/[shiftId]`)
- People (`/people`)
- Person Detail (`/people/[personId]`)
- Volunteer Portal (`/volunteer`)
- Organization Settings (`/settings`)

Use `?org=austin-mutual-aid` or `?org=community-food-network` to switch organizations.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Validate

```bash
npm run lint
npm run test
npm run build
```
