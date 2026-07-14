# Known Limitations
## Documented Boundaries and System Limitations

This file lists the known technical and operational constraints of the platform.

### 1. Supabase Storage Free Tier Limit (1GB)
*   **Limit:** The total storage size for uploaded photos cannot exceed 1GB.
*   **Risk:** If 500 households upload an average of 3 compressed photos of 800KB each, the storage reaches 1.2GB, breaching the free tier.
*   **Mitigation:** Enforce aggressive client-side image compression down to 80% quality. Admin must trigger Google Drive backups and clear out verified Supabase storage assets if the limit is approached.

### 2. Vercel Serverless Function Timeout (10 seconds)
*   **Limit:** Vercel free tier edge functions carry a hard execution timeout limit of 10 seconds.
*   **Risk:** Exporting large Excel workbooks or rendering complex PDF reports with charts on-the-fly may exceed this limit.
*   **Mitigation:** Keep PDF styling clean. Defer binary document generation scripts entirely to client-side libraries (like jsPDF and SheetJS running in browser thread) in Phase 2 if server-side function limits are triggered.

### 3. LocalStorage Size limit (5MB)
*   **Limit:** Browser localStorage sizes are limited to 5MB per origin.
*   **Risk:** Storing multiple surveys with uncompressed images in the offline queue can exhaust localStorage quickly.
*   **Mitigation:** Compress image blobs to small sizes (≤800KB) before saving to the localStorage queue, and restrict the queue size to a maximum of 5 pending items.
