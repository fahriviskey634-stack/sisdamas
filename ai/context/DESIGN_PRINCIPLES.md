# Design Principles
## Core Design System & Development Principles

This file documents the core design guidelines for the SISDAMAS platform to ensure consistency across updates.

### 1. Aesthetic Guidelines
*   **Vibrant, High-Contrast Palette:** Since surveyors operate outdoors in direct sunlight, the colors must meet a minimum WCAG 2.1 AA contrast ratio of 4.5:1 (preferably AAA 7:1 for body copy).
*   **Palette Tokens:**
    *   `--primary-500` (Indigo: `#4F46E5`): Primary call-to-actions, active links, and buttons.
    *   `--success-500` (Emerald: `#10B981`): Complete surveys, verified coordinates, success states, and green map markers.
    *   `--warning-500` (Amber: `#F59E0B`): Partial survey drafts, low GPS accuracy warnings, and yellow map markers.
    *   `--danger-500` (Red: `#EF4444`): Error logs, offline state banner, incomplete surveys, and red map markers.
    *   `--info-500` (Sky Blue: `#0EA5E9`): Verified/locked survey data and blue map markers.
    *   `--neutral-50` (Slate Light: `#F8FAFC`): Main canvas background, reducing sunlight glare compared to pure white.
    *   `--neutral-900` (Slate Dark: `#0F172A`): Typography, headings, and primary text.
*   **Typography System:** Plus Jakarta Sans for structural headings (Display, H1, H2, H3) and Inter for readable body copy. Fira Code for coordinates.

### 2. Mobile-First & Handheld Layouts
*   **Thumb-Zone Optimization:** All primary actions (such as "Save" and "+ Survey Baru" buttons) are positioned in the bottom 60% of the screen.
*   **Touch Targets:** Every button, select field, checkbox, and radio target is designed with a minimum tap area of 48×48px to prevent touch errors on low-end Android touch screens.

### 3. Progressive Simplification
*   Always implement the simplest possible solution under time constraints. Avoid adding complex nested libraries if native HTML5 browser capabilities (such as Geolocation and native Select inputs) can solve the problem.
*   Avoid post-processing coordinates with spatial databases (PostGIS) in Phase 1. Use double precision floats (`NUMERIC(10, 7)`) in the database.
