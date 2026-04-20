
# Khujo Demo Backend (TypeScript)

This backend is currently a demo implementation. The target production behavior is documented in `docs/` based on the real user flows.

## Quick Start

1. Install dependencies:

   npm install

2. Run in development mode (auto-reload):

   npm run dev

3. Build TypeScript:

   npm run build

4. Start built app:

   npm start

## Project Structure

- `src/` — TypeScript source files
- `dist/` — Compiled JavaScript output

## Endpoints

- GET `/` — Returns `{ message: 'Khujo Demo Backend is up' }`

## Documentation

- `docs/BACKEND_SYSTEM_DOCUMENTATION.md` — Full backend architecture, user flows, profile-completion contract, verification pipeline, and implementation checklist.
- `docs/API_REFERENCE.md` — Implemented API contracts plus planned production API contracts.
- `docs/CLERK_BACKEND_INTEGRATION.md` — Clerk frontend/backend integration strategy with JWT verification rules.
- `docs/DATABASE_SCHEMA_DOCUMENTATION.md` — PostgreSQL schema for `users` and `reports`, constraints, indexes, and `updated_at` trigger.

## Notes
- TypeScript config: `tsconfig.json`
- Express types: `@types/express`
- Node types: `@types/node`
