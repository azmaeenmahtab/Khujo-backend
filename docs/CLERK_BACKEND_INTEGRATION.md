# Clerk Integration Notes (Frontend + Backend)

## 1) Goal

Use Clerk for authentication in frontend and verify Clerk JWT on backend protected APIs.

## 2) Recommended Backend Libraries

For Express backend:
- `@clerk/express`

Install:
```bash
npm install @clerk/express
```

## 3) Authentication Flow

1. User signs in via Clerk UI in frontend.
2. Frontend obtains session token and sends:
   - `Authorization: Bearer <token>`
3. Backend middleware verifies token and extracts user identity.
4. Backend maps Clerk user (`sub`) to local user/profile record.

## 4) Express Middleware Pattern (Proposed)

Use route-level protection:
- Public routes: search endpoints
- Protected routes: profile, reports, report uploads
- Admin/Internal routes: stricter role/service-token checks

Example structure:
```ts
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/me', requireAuth(), meRouter);
app.use('/api/v1/reports', requireAuth(), reportsRouter);
```

Identity fields expected from token claims:
- `sub` (Clerk user id)
- `email` or email list claim
- `sid` (session id, optional)

## 5) Authorization Rules (Proposed)

- `canSubmitReport` requires:
  - authenticated user
  - profile completed on server-side evaluation
- Owner-only report access:
  - report `userId` must match authenticated user id
- Admin endpoints:
  - require role claim and backend role check

## 6) Frontend Integration Tips

- Protect UI pages with Clerk components/middleware.
- Do not rely only on UI checks for profile completion.
- Before showing report form submit action, call:
  - `GET /api/v1/me/report-eligibility`

Suggested UX:
- If ineligible, show missing fields and deep-link to profile page.
- If eligible, allow submission and show report id tracking.

## 7) Webhook Sync (Recommended)

Use Clerk webhooks to keep local user table in sync:
- `user.created`
- `user.updated`
- `user.deleted`

Persist:
- clerkUserId
- primary email
- basic identity metadata

## 8) Security Notes

- Verify JWT issuer/audience consistently across environments.
- Keep `CLERK_SECRET_KEY` server-only.
- Reject tokens on signature/issuer mismatch.
- Add request IDs and auth failure logs without exposing sensitive claims.

## 9) Suggested Rollout Order

1. Add backend auth middleware and protect planned routes.
2. Implement profile endpoints and server-side completion logic.
3. Implement report creation endpoint with eligibility enforcement.
4. Add evidence upload and verification orchestration.
5. Expose public IMEI search from granted reports only.
