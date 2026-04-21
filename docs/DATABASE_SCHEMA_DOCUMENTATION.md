# Khujo Backend Database Schema Documentation

This document defines the initial PostgreSQL schema for core reporting flows.

## 1) Tables Overview

- `users`: stores authenticated user identity and contact data.
- `reports`: stores stolen phone report submissions and verification state.

Relationship:
- One `users` row can have many `reports` rows.
- `reports.user_id` references `users.id`.

## 2) `users` Table

Columns:
- `id` `BIGSERIAL` primary key
- `clerk_id` `TEXT` unique, not null
- `name` `TEXT` not null
- `phone_number` `VARCHAR(20)` unique, not null
- `nid` `TEXT` nullable
- `created_at` `TIMESTAMPTZ` not null, default `NOW()`

SQL:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    nid TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 3) `reports` Table

Columns:
- `id` `BIGSERIAL` primary key
- `user_id` `BIGINT` foreign key to `users(id)`
- `imei_number_1` `VARCHAR(20)` indexed, not null
- `imei_number_2` `VARCHAR(20)` indexed, nullable
- `phone_brand` `TEXT` not null
- `phone_model` `TEXT` not null
- `theft_location` `TEXT` not null
- `theft_date` `DATE` not null
- `gd_copy_image_url` `TEXT` not null
- `phone_box_image_url` `TEXT` nullable
- `gd_number` `TEXT` nullable
- `police_station` `TEXT` nullable
- `verification_status` `TEXT` not null, default `PENDING`
- `verification_score` `SMALLINT` nullable, allowed range `0..100`
- `created_at` `TIMESTAMPTZ` not null, default `NOW()`
- `updated_at` `TIMESTAMPTZ` not null, default `NOW()`

Constraints:
- `verification_status` allowed values:
  - `PENDING`
  - `APPROVED`
  - `REJECTED`
  - `MANUAL_REVIEW`
- `verification_score` must be between `0` and `100` when present.

SQL:

```sql
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    imei_number_1 VARCHAR(20) NOT NULL,
    imei_number_2 VARCHAR(20) NULL,
    phone_brand TEXT NOT NULL,
    phone_model TEXT NOT NULL,
    theft_location TEXT NOT NULL,
    theft_date DATE NOT NULL,
    gd_copy_image_url TEXT NOT NULL,
    phone_box_image_url TEXT NULL,
    gd_number TEXT NULL,
    police_station TEXT NULL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW')),
    verification_score SMALLINT NULL
        CHECK (verification_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_imei_number_1 ON reports(imei_number_1);
CREATE INDEX idx_reports_imei_number_2 ON reports(imei_number_2);
```

## 4) `updated_at` Trigger

Purpose:
- Automatically refresh `reports.updated_at` on every row update.

SQL:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_set_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

## 5) Suggested Migration Order

1. Create `users` table.
2. Create `reports` table and index.
3. Create trigger function and trigger.

## 6) Notes

- Keep all future schema changes in versioned migration files.
- Consider PostgreSQL `ENUM` for `verification_status` in a later migration if strict type-level enforcement is preferred.