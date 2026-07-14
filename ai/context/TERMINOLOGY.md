# Terminology Mapping
## UI Label to Database Column References

This file maps the Bahasa Indonesia UI labels to their technical PostgreSQL database columns.

### 1. Geographic Terminology
*   **Dusun:** Sub-village ➔ `dusun` table.
*   **RW:** Rukun Warga ➔ `rw` table (`rw_number`).
*   **RT:** Rukun Tetangga ➔ `rt` table (`rt_number`).
*   **Rumah Tangga:** Household ➔ `household` table.

### 2. Survey Terminology
*   **Kepala Keluarga:** Head of Household ➔ `household.kk_name`.
*   **Nomor KK:** Family Card Number ➔ `household.kk_number`.
*   **Jumlah Anggota:** Family Size ➔ `survey.family_size`.
*   **Status Kepemilikan:** Housing Status ➔ `survey.housing_status` (values: `'own'`, `'rent'`, `'sharing'`).
*   **Kondisi Fisik:** Housing Condition ➔ `survey.housing_condition` (values: `'good'`, `'moderate'`, `'damaged'`).
*   **Masalah:** Problems ➔ `problem` table.
*   **Potensi:** Potentials ➔ `potential` table.
*   **Foto:** Photo attachments ➔ `household_photo` table.

### 3. Cycle 3 & 4 Terminology
*   **Matriks Prioritas:** USG Matrix ➔ `priority_matrix` table.
*   **Skor Total:** Total USG Score ➔ `priority_item.total_score` (`urgency + seriousness + growth`).
*   **Peringkat:** Priority Rank ➔ `priority_item.rank_number`.
*   **Program KKN:** Development program ➔ `program` table.
*   **Tugas:** Tasks ➔ `program_task` table.
*   **Penanggung Jawab (PIC):** Program leader ➔ `program.pic_id` (references user).
