# Future Ideas
## Deferrals and Growth Paths for Post-Phase 2

This file tracks feature ideas and extension paths for the platform after the current KKN cycle ends.

### 1. Multi-Village & Multi-Tenant Support
*   **Context:** Currently hardcoded to Kelompok 56 Desa Sukahaji. The database schema contains a `project` table to prevent future rewrites.
*   **Idea:** Expose a project switcher in the Admin panel so future KKN teams from different villages can register their own project scopes, RW lists, and surveyors.

### 2. Native Android App (React Native/Capacitor wrapper)
*   **Context:** PWA works well, but lacks background sync scheduling controls on some older iOS/Android devices.
*   **Idea:** Wrap the Next.js frontend with Capacitor to build a native Android APK, allowing background sync execution via OS-level task planners.

### 3. AI-Assisted Problem Taxonomy
*   **Context:** Surveyors write free-text descriptions of problems, which can be inconsistent.
*   **Idea:** Use a lightweight serverless LLM edge function to auto-suggest categories (Infrastruktur, Ekonomi) from free-text entries as the user types.

### 4. Interactive Drawing & Polygons (Leaflet Draw)
*   **Context:** RT/RW borders are estimated visually today.
*   **Idea:** Add drawing tools to the Map component so Admins can draw RT/RW border polygons and color-code them by survey completion % or problem density.
