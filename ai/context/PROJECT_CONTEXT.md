# Project Context
## SISDAMAS Digital Platform — KKN Kelompok 56 Sukahaji

This file records the core context of the project for all agents and sessions.

### 1. General Project Information
*   **Target Village:** Dusun 2, Desa Sukahaji, Kecamatan Cipendeuy, Kabupaten Bandung Barat, West Java, Indonesia.
*   **KKN Team:** Kelompok 56, UIN Sunan Gunung Djati Bandung (15 students).
*   **Solo Developer Constraint:** Developed entirely by a single KKN student who also participates in fieldwork.
*   **Timeline Constraint:** Extremely short build window. MVP must survive an 8-day critical field window:
    *   Day 2: Sticky notes board active for community rembug warga session.
    *   Day 4–8: Household survey form + GPS capture + GIS map active.
    *   Remaining ~32 days: Phase 2 features (prioritization, programs, reporting).
*   **Budget Constraint:** Effectively Rp0. The infrastructure relies entirely on the free tiers of Vercel and Supabase.

### 2. Geographic Focus
The geographical structure is strictly structured as follows:
`Project` ➔ `Dusun` (Dusun 2) ➔ `RW` (RW 01, RW 02, RW 03) ➔ `RT` (RT 01 to RT 09) ➔ `Household` (Rumah Tangga).
*   No flat resident ("warga") table is created to save survey execution time and database space.

### 3. Deployed App URL Context
*   Production Domain: `https://sisdamas-kkn56.vercel.app`
*   Database Engine: Supabase PostgreSQL (Free Tier)
*   Mapping Interface: Leaflet.js with OpenStreetMap (OSM) tiles.
