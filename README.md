# Volunteer Planner MVP

Next.js + MongoDB-ready MVP for volunteer scheduling across multiple organizations.

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

MongoDB is accessed directly via the native driver. Set `DATABASE_URL` in your `.env` file (see `.env.example`).

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

1. Copy `.env.example` to `.env` and fill in your MongoDB connection string and JWT secret.
   - For **MongoDB Atlas**: get the connection string from your cluster dashboard (Connect → Drivers).
     Ensure your IP is listed under Atlas → Network Access, and that the database user's password
     is URL-encoded if it contains special characters (`@` → `%40`, `#` → `%23`, etc.).
   - For a **local MongoDB** instance: use `mongodb://localhost:27017/volunteer_planner`.

```bash
cp .env.example .env
# edit .env with your actual credentials
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
