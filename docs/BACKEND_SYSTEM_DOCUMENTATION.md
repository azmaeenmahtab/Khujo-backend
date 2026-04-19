# Khujo Backend System Documentation

## 1) Scope and Reality Check

This backend is currently a demo scaffold. The actual product behavior is driven by the real user flows below, and this document bridges the gap between the current demo and the target production backend.

Real product flows:
- Buyer flow: search IMEI before purchasing a second-hand phone and immediately see if the phone was reported stolen.
- Victim flow: sign in, complete profile, submit stolen phone report, then backend verification pipeline decides if the report is granted.

## 2) Current Demo Backend (Implemented Today)

Tech stack:
- Express + TypeScript
- Multer (in-memory file upload)
- Google Vision OCR
- EXIF parser utility

Implemented routes:
- `GET /` -> health message
- `GET /test2` -> test message
- `GET /api/test` -> OCR route health
- `POST /api/upload-gd-doc` -> uploads GD image and compares extracted IMEI with user-provided IMEI

Current services:
- `src/services/visionService.ts`
  - OCR text extraction from image buffer
  - IMEI extraction regex from text
- `src/services/exifService.ts`
  - EXIF extraction
  - Basic authenticity heuristic (camera tags present, no known editing software)

## 3) Target Architecture (Production-Oriented)

Recommended modules:
- `auth`: Clerk JWT verification middleware and authorization helpers
- `users`: profile data, profile completeness checks
- `reports`: stolen device report submission and lifecycle management
- `verification`: EXIF check, AI authenticity check, OCR extraction
- `search`: IMEI search endpoint for public users
- `leads`: helper submissions from people who found suspicious devices

Recommended storage model (logical):
- `users`
- `user_profiles`
- `stolen_reports`
- `report_media`
- `verification_runs`
- `public_leads`
- `audit_logs`

## 4) End-to-End User Flows

### 4.1 Buyer Search Flow
1. User enters IMEI in search UI.
2. Frontend calls public search API.
3. Backend returns one of:
   - `not_found`: no stolen report
   - `match_found`: report exists and is granted/active
4. If match found, user can submit a lead/tip with optional contact/location details.

### 4.2 Report Submission Flow
1. User signs in with Clerk.
2. Backend identifies user by Clerk `sub` claim.
3. User must have `profileCompleted = true`.
4. User submits report payload and evidence files.
5. Backend runs verification pipeline:
   - EXIF integrity check
   - Hugging Face authenticity model check
   - OCR extraction from GD copy and structured validation
6. If verification passes threshold and rules, report status becomes `GRANTED`.
7. Granted report becomes searchable in public IMEI search.

## 5) Report Status Lifecycle Contract

Status enum:
- `DRAFT`
- `SUBMITTED`
- `EXIF_CHECKED`
- `AUTHENTICITY_CHECKED`
- `OCR_CHECKED`
- `PENDING_REVIEW`
- `GRANTED`
- `REJECTED`

Rules:
- Only `GRANTED` reports appear in public buyer search results.
- `REJECTED` reports remain private to owner/admin.
- Pipeline output must be persisted with reasons and confidence values for traceability.

## 6) Profile Completion Contract (Proposed)

A user is eligible to create a report only if all required fields exist and are validated.

Required profile fields:
- fullName
- phone
- email (from Clerk or profile)
- nationalIdOrPassport
- presentAddress
- permanentAddress
- emergencyContactName
- emergencyContactPhone

Computed contract:
- `profileCompleted: boolean`
- `missingFields: string[]`

Eligibility API should return:
- `canSubmitReport: boolean`
- `profileCompleted: boolean`
- `missingFields: string[]`

## 7) Verification Pipeline Contract

Input:
- Device IMEI(s)
- Device metadata (brand/model, purchase context)
- Uploaded files:
  - phone box image
  - GD copy image/PDF

Pipeline stages:
1. `exif_check`
   - Reads EXIF tags, detects editing software hints, device camera metadata consistency.
2. `authenticity_model_check`
   - Calls Hugging Face model endpoint.
   - Returns score + label (for example `authentic` / `tampered`).
3. `ocr_gd_check`
   - OCR the GD file.
   - Extract IMEI, report date, police station, GD number.
   - Match extracted IMEI with submitted IMEI.

Decision output:
- `verificationDecision`: `pass` | `manual_review` | `fail`
- `verificationScore`: number (0-1)
- `reasons`: string[]

Grant criteria (proposed baseline):
- EXIF not suspicious
- Authenticity score above configured threshold
- OCR extracted IMEI matches submitted IMEI
- Minimum required GD fields extracted

## 8) Security and Compliance Baseline

- Verify Clerk JWT on every protected endpoint.
- Validate MIME type and file size for uploads.
- Never trust client-side `profileCompleted`; compute server-side.
- Add request ID for traceability in logs.
- Store evidence files in object storage (not in process memory only).
- Redact PII in logs.

## 9) Environment Variables (Current + Planned)

Current:
- `PORT`
- `GOOGLE_APPLICATION_CREDENTIALS`

Planned:
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY` (frontend)
- `CLERK_JWT_ISSUER`
- `HUGGINGFACE_API_TOKEN`
- `HUGGINGFACE_MODEL_URL`
- `DATABASE_URL`
- `FILE_STORAGE_BUCKET`
- `FILE_STORAGE_REGION`

## 10) Progress Tracking Checklist

Use this checklist to track implementation against the target backend:

- [x] Demo OCR endpoint exists
- [x] Demo EXIF utility exists
- [ ] Clerk JWT middleware added in backend
- [ ] User/profile persistence introduced
- [ ] Profile completion eligibility endpoint added
- [ ] Report submission endpoint added
- [ ] Verification pipeline orchestration endpoint/job added
- [ ] Public IMEI search endpoint added
- [ ] Helper lead submission endpoint added
- [ ] Admin review/override endpoints added
