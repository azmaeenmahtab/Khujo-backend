# 📵 KHUJO — Backend

A document-verified stolen mobile phone reporting and IMEI lookup system built for Bangladesh. Users report stolen phones with a Police GD copy, which goes through a multi-stage automated verification pipeline before the phone's IMEI is indexed in the stolen device database.

---

## 🔍 What It Does

- Accepts theft reports with a **Police GD copy**, IMEI number, theft location, and optional phone box photo
- Runs the GD document through a **multi-stage verification pipeline** (EXIF → ELA → Vision LLM → OCR → IMEI match → duplicate check)
- Routes low-confidence cases to an **admin review queue**
- Indexes verified stolen IMEIs in the database
- Exposes a **public IMEI lookup API** so buyers can check secondhand phones before purchasing

---

## 🧰 Tech Stack

### Core Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Document Verification Pipeline
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![Pillow](https://img.shields.io/badge/Pillow-FFD43B?style=for-the-badge&logo=python&logoColor=black)

### AI / ML
![OpenAI](https://img.shields.io/badge/GPT--4o_Vision-412991?style=for-the-badge&logo=openai&logoColor=white)
![EasyOCR](https://img.shields.io/badge/EasyOCR-Bengali%20%2B%20English-blue?style=for-the-badge)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

### Storage & Infrastructure
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🏗️ Verification Pipeline

Every theft report passes through 8 sequential stages before being approved:

```
Report Submitted
      │
      ▼
┌─────────────────────────────────────────────┐
│  Stage 1 — EXIF Metadata Check              │
│  GPS coords, timestamp, device model        │
│  Tool: ExifRead (Python)                    │
└──────────────────────┬──────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 2 — ELA Tamper Detection             │
│  JPEG re-compression artifact analysis      │
│  Tool: Pillow / OpenCV                      │
└──────────────────────┬──────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 3 — Vision LLM Structure Check       │
│  GD header, seal, station format validation │
│  Model: GPT-4o Vision / Claude              │
└──────────────────────┬──────────────────────┘
                       │ pass
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 4 — OCR Text Extraction              │
│  Extract IMEI, GD number, date from doc     │
│  Tool: EasyOCR (Bengali + English)          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 5 — IMEI Match                       │
│  OCR-extracted IMEI == submitted IMEI       │
└──────────────────────┬──────────────────────┘
                       │ match
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 6 — Duplicate / Spam Check           │
│  Same IMEI, GD number, or user fingerprint  │
│  Tool: PostgreSQL query                     │
└──────────────────────┬──────────────────────┘
                       │ unique
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 7 — Confidence Score Routing         │
│  High confidence → auto approve             │
│  Low confidence  → admin review queue       │
└──────────────────────┬──────────────────────┘
                       │ approved
                       ▼
┌─────────────────────────────────────────────┐
│  Stage 8 — Verified & Indexed               │
│  IMEI stored in stolen device database      │
│  User notified, public lookup enabled       │
└─────────────────────────────────────────────┘
```

> **Note:** Stage 1 (EXIF) is a soft check — anomalies are flagged and logged but do not hard-reject the report, since many uploads have EXIF stripped by messaging apps. Stages 2, 3, and 5 are hard rejects.

---

## 📡 API Endpoints

### Report Submission
```
POST /api/v1/reports
Content-Type: multipart/form-data

Fields:
  gd_copy        File    (required) — scanned GD document image
  imei           String  (required) — 15-digit IMEI number
  theft_location String  (required) — district / area
  phone_box      File    (optional) — photo of phone box
```

### Report Status
```
GET /api/v1/reports/:reportId/status
```

### Public IMEI Lookup
```
GET /api/v1/lookup?imei=<15-digit-imei>

Response:
{
  "imei": "358765000000000",
  "status": "stolen" | "clear",
  "reported_at": "2025-03-12T09:40:00Z",   // only if stolen
  "theft_location": "Dhaka, Mirpur"         // only if stolen
}
```

### Admin Review Queue
```
GET  /api/v1/admin/queue
POST /api/v1/admin/queue/:reportId/approve
POST /api/v1/admin/queue/:reportId/reject
```

---

## 📁 Project Structure

```
mobilesentry-backend/
├── src/
│   ├── routes/
│   │   ├── reports.ts          # Submission and status endpoints
│   │   ├── lookup.ts           # Public IMEI lookup
│   │   └── admin.ts            # Admin review queue
│   ├── pipeline/
│   │   ├── exifCheck.ts        # Stage 1 — EXIF metadata
│   │   ├── elaDetection.py     # Stage 2 — ELA tamper detection
│   │   ├── visionLLM.ts        # Stage 3 — GPT-4o structure check
│   │   ├── ocrExtract.py       # Stage 4 — EasyOCR extraction
│   │   ├── imeiMatch.ts        # Stage 5 — IMEI comparison
│   │   ├── duplicateCheck.ts   # Stage 6 — Duplicate detection
│   │   └── confidenceRouter.ts # Stage 7 — Routing logic
│   ├── models/
│   │   ├── Report.ts
│   │   └── StolenDevice.ts
│   ├── services/
│   │   ├── storage.ts          # S3 file uploads
│   │   ├── notify.ts           # User notifications
│   │   └── queue.ts            # Admin queue management
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts           # Multer config
│   └── app.ts
├── python/
│   ├── ela_detect.py
│   └── ocr_extract.py
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## ⚙️ Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mobilesentry

# Redis
REDIS_URL=redis://localhost:6379

# AI / Vision
OPENAI_API_KEY=your_openai_key

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=mobilesentry-uploads
AWS_REGION=ap-south-1

# Admin
ADMIN_SECRET=your_admin_secret
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- Python 3.10+
- PostgreSQL 15+
- Docker (optional but recommended)

### With Docker

```bash
git clone https://github.com/your-username/mobilesentry-backend.git
cd mobilesentry-backend
cp .env.example .env
docker-compose up --build
```

### Manual Setup

```bash
# Install Node dependencies
npm install

# Install Python dependencies
pip install pillow easyocr exifread opencv-python

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev
```

---

## 🛡️ Security Notes

- All GD document uploads are stored privately in S3 — never publicly accessible
- IMEI lookup returns minimal data (no user info, no GD details) to protect reporter privacy
- Rate limiting is applied on all public endpoints via Redis
- Admin endpoints require token-based authentication

---

## 🗺️ Roadmap

- [ ] Bangladesh Police GD format fine-tuned classifier (HuggingFace ViT)
- [ ] SMS notification for report status updates
- [ ] Mobile app (Android first — React Native)
- [ ] BTRC IMEI database cross-reference integration
- [ ] Multi-language support (বাংলা interface)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

> Built to fight mobile theft and the secondhand phone syndicate in Bangladesh. 🇧🇩
