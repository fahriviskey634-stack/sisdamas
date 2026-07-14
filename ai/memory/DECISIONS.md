# Architectural Decisions Registry
## Core System Design Choices

This file documents the key technical and business decisions made for the project.

### 1. Household-Centered Design (No Warga Table)
*   **Context:** KKN door-to-door surveys interview the household as a single unit. Individual resident profiles would double survey completion times.
*   **Decision:** Build `household` as the primary unit of observation. Family stats (`family_size`) are stored as metadata. No `warga` table.

### 2. Standard Decimal GPS (No PostGIS)
*   **Context:** Phase 1 needs to compile map pins rapidly. Spatial queries are not needed immediately.
*   **Decision:** Coordinates are stored as two standard numeric columns (`latitude`, `longitude` as `NUMERIC(10, 7)`) instead of native PostGIS point data types. Simplifies deployment and SWR client integration.

### 3. Client Image Compression (Max 800KB JPEGs)
*   **Context:** Storage is limited to 1GB under the Supabase free tier. Mobile network upload speeds in the village are slow.
*   **Decision:** Compress images on the client side using HTML5 Canvas resampling before sending over the network. Target file sizes are capped at 800KB.

### 4. Google Drive Service Account
*   **Context:** OAuth tokens expire after 60 days, risking synchronization failures during the 40-day KKN.
*   **Decision:** Connect Vercel to Google Drive and Google Calendar API using a GCP Service Account key, bypassing per-user authorization screens.

### 5. PostgreSQL Row Level Security (RLS) as Primary Gateway
*   **Context:** Solo developer cannot afford to maintain complex custom RBAC logic on middleware and backend routes.
*   **Decision:** Enforce policies directly at the database layer using Supabase RLS. All PostgREST queries automatically filter rows based on JWT claims (`role = 'kkn_member'` or `'super_admin'`).

### 6. Public Coordinate Obfuscation (3 Decimal Places)
*   **Context:** Village officials and the public need a map, but precise household coordinates represent sensitive PII.
*   **Decision:** Round Latitude and Longitude values to exactly 3 decimal places on all public endpoints. Shifting coordinates by ~110 meters protects residents' privacy while still displaying RT coverage.

### 7. httpOnly Cookie for JWT Tokens
*   **Context:** Storing JWT tokens in browser localStorage exposes them to Cross-Site Scripting (XSS) attacks.
*   **Decision:** Store session JWT access tokens in secure, httpOnly cookies with `SameSite=Strict` flag.

### 8. Strict Timeline Release Alignment
*   **Context:** KKN field activities run on a fixed schedule. Tools must be ready when the corresponding cycle starts.
*   **Decision:** Split releases into two strict field milestones: Day 2 KKN (Sticky Notes Board live) and Day 4 KKN (Survey form + GPS + Leaflet map live). Other features are deferred to Phase 2 (Day 9 onwards).

### 9. Daily Development & Operations Loop
*   **Context:** Modifying production files during surveyor active hours risks data loss or synchronization errors.
*   **Decision:** Establish a strict daily deployment routine: Field window (morning, no commits), dev/fix window (afternoon, develop branch), staging testing (late afternoon, preview build), production release (evening, main branch), and manual database backup (night, 21:00-22:00 WIB).
