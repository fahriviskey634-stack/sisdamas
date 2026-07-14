# Lessons Learned
## Historical Learnings from Platform Development Sprints

This file captures findings from previous development sessions to avoid repeating design mistakes.

### 1. Avoid Resident Entity Complexity
*   **Learning:** Attempting to build an entity for individual residents ("warga") makes the database schema over-complicated and delays surveyors. 
*   **Action:** Removed any resident table and designed the system around the household unit (`household` ➔ `survey`).

### 2. Service Accounts vs. OAuth Client
*   **Learning:** Setting up individual user OAuth for KKN students leads to token expiration issues during the 40-day field deployment, causing sync failures.
*   **Action:** Adopted a GCP Service Account credential strategy for Google Drive and Google Calendar integrations.

### 3. Client Image Compression Is Essential
*   **Learning:** Mobile connections in rural locations are extremely slow. Direct uploads of 4MB+ raw camera photos result in high request failure rates.
*   **Action:** Enforce browser canvas image downsampling down to ≤800KB before network transmission.

### 4. Verbal Consent Protocol (Etika Lapangan)
*   **Learning:** Surveyors collecting household photos and coordinates face suspicion and survey fatigue from residents unless a clear, respectful consent notice is read out.
*   **Action:** Formally established a standard verbal consent protocol to be read aloud before starting interviews. If residents refuse, the home is bypassed and coordinates are not saved.

### 5. Daily Operations Isolation
*   **Learning:** Modifying application code or deploying updates to the server during surveyor active survey hours leads to client sync crashes, session dropouts, and data loss.
*   **Action:** Separate codebase changes from active field hours. Push all updates to Vercel production strictly in the evening (18:00 - 20:00 WIB) after the day's survey submissions have completed.

### Status Pengerjaan Terakhir (Auto-Saved)
*   **Terakhir Diperbarui:** 14/07/2026 18:15
*   **Tugas Selesai:** 0 / 0
*   **Tugas Sedang Berjalan:** 0
