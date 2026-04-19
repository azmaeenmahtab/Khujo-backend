# Khujo Backend API Reference

## 1) API Versioning Strategy

- Current demo endpoints are unversioned (`/`, `/api/*`).
- Planned production endpoints use `/api/v1/*`.

## 2) Implemented Endpoints (Demo)

### GET /
Purpose:
- Service health check.

Response 200:
```json
{ "message": "Khujo Demo Backend is up" }
```

### GET /test2
Purpose:
- Additional route wiring check.

Response 200:
```json
{ "message": "Khujo Demo Backend is up 222" }
```

### GET /api/test
Purpose:
- OCR router health check.

Response 200:
```json
{ "message": "ocr route is working" }
```

### POST /api/upload-gd-doc
Purpose:
- Upload GD image and compare extracted IMEI(s) with submitted IMEI.

Request:
- Content-Type: `multipart/form-data`
- Form fields expected from the current Report Device form:
  - `imei` (string, required, mirrors `imei1` and used by backend matching logic)
  - `imei1` (string, required by frontend validation)
  - `imei2` (string, optional)
  - `deviceName` (string, optional)
  - `transactionId` (string, optional)
  - `division` (string, optional)
  - `district` (string, optional)
  - `upazila` (string, optional)
  - `locationNote` (string, optional)
  - `gdImage` (file, required)
  - `boxImage` (file, optional)

Backend processing note (current implementation):
- Currently only `imei` and `gdImage` are used for OCR matching.
- Other fields are accepted as part of the form payload for forward compatibility with the planned `/api/v1/reports` flow.

Response 200:
```json
{
  "userImei": "356987614147252",
  "extractedImeis": ["356987614147252"],
  "matched": true
}
```

Response 400:
```json
{ "error": "gdImage file is required" }
```
or
```json
{ "error": "imei field is required" }
```

Response 500:
```json
{ "error": "ocr_failed", "details": "<message>" }
```

## 3) Planned Endpoints (Target Product)

### Public Search and Citizen Help

#### GET /api/v1/devices/search
Query params:
- `imei` (required)

Response 200 (no match):
```json
{
  "status": "not_found",
  "imei": "356987614147252"
}
```

Response 200 (match):
```json
{
  "status": "match_found",
  "imei": "356987614147252",
  "report": {
    "reportId": "rep_123",
    "deviceName": "Samsung Galaxy S24",
    "reportedDate": "2026-03-13",
    "stolenFrom": "Dhaka",
    "ownerDisplayName": "S*** A***"
  }
}
```

#### POST /api/v1/leads
Purpose:
- Let a search user provide helpful info after finding a match.

Auth:
- Public (optional authenticated path allowed)

Request body:
```json
{
  "imei": "356987614147252",
  "phoneNumber": "017XXXXXXXX",
  "division": "Dhaka",
  "district": "Dhaka",
  "thana": "Banani",
  "note": "Saw this device in local market"
}
```

Response 201:
```json
{ "leadId": "lead_001", "status": "received" }
```

### Authentication and Profile

#### GET /api/v1/me
Purpose:
- Return current authenticated user summary.

Auth:
- Required (Clerk JWT)

#### GET /api/v1/me/profile
Purpose:
- Get profile and completion status.

Auth:
- Required

Response 200:
```json
{
  "profile": {
    "fullName": "...",
    "phone": "...",
    "email": "...",
    "nationalIdOrPassport": "...",
    "presentAddress": "...",
    "permanentAddress": "...",
    "emergencyContactName": "...",
    "emergencyContactPhone": "..."
  },
  "profileCompleted": true,
  "missingFields": []
}
```

#### PUT /api/v1/me/profile
Purpose:
- Create/update profile fields.

Auth:
- Required

#### GET /api/v1/me/report-eligibility
Purpose:
- Server-side eligibility check before report submission.

Auth:
- Required

Response 200:
```json
{
  "canSubmitReport": true,
  "profileCompleted": true,
  "missingFields": []
}
```

### Report Submission and Tracking

#### POST /api/v1/reports
Purpose:
- Submit new stolen phone report.

Auth:
- Required

Precondition:
- `profileCompleted = true`

Request body:
```json
{
  "imei1": "356987614147252",
  "imei2": "",
  "deviceName": "Samsung Galaxy S24",
  "transactionId": "TXN-12345",
  "stolenLocation": {
    "division": "Dhaka",
    "district": "Dhaka",
    "thana": "Banani",
    "details": "Near market area"
  },
  "stolenAt": "2026-03-10T14:00:00.000Z"
}
```

Response 201:
```json
{
  "reportId": "rep_123",
  "status": "SUBMITTED"
}
```

Response 403:
```json
{
  "error": "profile_incomplete",
  "missingFields": ["nationalIdOrPassport"]
}
```

#### POST /api/v1/reports/:reportId/evidence
Purpose:
- Upload evidence files for report.

Auth:
- Required

Form-data fields:
- `phoneBoxImage` (optional)
- `gdCopy` (required)

Response 200:
```json
{
  "reportId": "rep_123",
  "status": "SUBMITTED",
  "files": {
    "phoneBoxImage": "stored",
    "gdCopy": "stored"
  }
}
```

#### GET /api/v1/reports/:reportId
Purpose:
- View report details and verification status.

Auth:
- Required (owner or admin)

#### GET /api/v1/reports
Purpose:
- List current user reports.

Auth:
- Required

## 4) Verification Pipeline Endpoints (Planned)

These may be internal worker endpoints or asynchronous queue jobs.

### POST /api/v1/internal/reports/:reportId/verify
Purpose:
- Orchestrate full verification pipeline for a report.

Auth:
- Internal service token only

Response 202:
```json
{
  "reportId": "rep_123",
  "status": "verification_started"
}
```

### GET /api/v1/internal/reports/:reportId/verification-result
Response 200:
```json
{
  "reportId": "rep_123",
  "stages": {
    "exif": { "status": "pass", "reason": "camera metadata present" },
    "authenticityModel": { "status": "pass", "score": 0.93 },
    "ocr": {
      "status": "pass",
      "extractedImei": "356987614147252",
      "gdNumber": "GD-77891",
      "policeStation": "Banani PS"
    }
  },
  "decision": "GRANTED"
}
```

## 5) Error Contract (Planned Standard)

Use a consistent error shape:
```json
{
  "error": {
    "code": "profile_incomplete",
    "message": "Profile must be completed before submitting a report",
    "details": {
      "missingFields": ["nationalIdOrPassport"]
    },
    "requestId": "req_abc123"
  }
}
```

Common status codes:
- `200` success read/update
- `201` created
- `202` async accepted
- `400` validation error
- `401` invalid/missing token
- `403` forbidden/eligibility failed
- `404` resource not found
- `409` conflict/duplicate IMEI report
- `500` internal error
