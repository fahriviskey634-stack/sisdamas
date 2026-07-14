# ROLE

You are acting as an Enterprise Security Team consisting of:

- Chief Information Security Officer (CISO)
- Principal Security Architect
- Application Security Engineer
- Cloud Security Engineer
- Identity & Access Management Specialist
- OWASP Expert
- Supabase Security Expert
- API Security Engineer
- GIS Security Specialist
- Privacy & Data Protection Consultant

You have already completed:

✔ Project Foundation

✔ Product Discovery

✔ System Blueprint

✔ Product Requirements Document

✔ UX Specification

✔ Technical Specification

✔ Database Specification

✔ Data Flow Specification

✔ API Specification

Never contradict previous documents.

Your responsibility is to design a practical and secure architecture for the SISDAMAS Digital Platform.

Security recommendations must fit a university KKN project with limited budget while still following modern security best practices.

---

# OBJECTIVE

Create a complete Security Specification.

Protect:

- User accounts
- Survey data
- Household information
- GPS coordinates
- Documentation
- Google integrations
- API
- Database
- File uploads

The design should prioritize simplicity, maintainability, and real-world usability.

---

# SECURITY PRINCIPLES

Explain and apply:

- Least Privilege
- Defense in Depth
- Secure by Default
- Privacy by Design
- Zero Trust (where appropriate)
- Principle of Least Knowledge
- Fail Secure
- Secure Configuration

Explain how each principle applies to this project.

---

# THREAT MODEL

Identify realistic threats.

Examples:

Unauthorized Login

Stolen Session

Fake Survey Submission

GPS Manipulation

Duplicate Survey

Mass File Upload

Malicious File Upload

SQL Injection

XSS

CSRF

Broken Authentication

Broken Access Control

Sensitive Data Exposure

API Abuse

Google Drive Misconfiguration

Lost Mobile Device

Offline Data Leakage

Explain likelihood and impact.

Provide mitigation.

---

# USER AUTHENTICATION

Design authentication.

Google Login

Email Login (optional)

Password Policy

Session Management

Session Timeout

Remember Me

Logout

Password Reset

Explain security considerations.

---

# AUTHORIZATION

Design Role-Based Access Control (RBAC).

Roles:

Super Administrator

KKN Team Member

Public Visitor

For every role define:

Permissions

Restricted Actions

Read Access

Write Access

Delete Access

Approval Rights

Explain rationale.

---

# DATA PROTECTION

Classify all data into:

Public

Internal

Sensitive

Restricted

For each category define:

Storage

Transmission

Visibility

Retention

Deletion

Backup

Encryption

---

# GPS PRIVACY

Design how GPS data should be protected.

Consider:

Coordinate precision

Public map visibility

Internal map visibility

Data export

Masking options

Explain privacy implications.

---

# FILE UPLOAD SECURITY

Protect against:

Executable files

Oversized files

Malicious images

Duplicate uploads

Virus risks

Metadata leakage

Recommended file types

Maximum size

File naming convention

---

# API SECURITY

Protect APIs using:

Authentication

Authorization

Rate Limiting

Request Validation

Response Validation

Security Headers

Input Sanitization

Output Encoding

CORS

Replay Protection

Explain recommendations.

---

# DATABASE SECURITY

Recommend:

Supabase Row Level Security (RLS)

Least privilege

Audit logging

Backups

Soft delete

Encryption at rest

Encryption in transit

Secure migrations

Explain every recommendation.

---

# GOOGLE INTEGRATION SECURITY

Secure:

Google Drive

Google Calendar

OAuth

API Keys

Folder permissions

Service Accounts (if used)

Secret Management

---

# OFFLINE SECURITY

Protect offline survey data.

Device storage

Temporary cache

Offline queue

Synchronization

Local encryption (if appropriate)

Data cleanup after sync

Explain risks.

---

# LOGGING & AUDIT

Log:

Login

Logout

Survey creation

Survey update

Survey deletion

GPS changes

File upload

Role changes

Failed logins

Permission denials

Explain retention policy.

---

# OWASP TOP 10 REVIEW

Review the architecture against the latest OWASP Top 10.

For each applicable category:

Explain the risk.

Evaluate current design.

Recommend mitigation.

---

# SECURITY TESTING

Recommend:

Authentication Testing

Authorization Testing

Input Validation Testing

File Upload Testing

API Testing

GPS Validation Testing

Offline Testing

Penetration Testing (lightweight)

Checklist before deployment.

---

# INCIDENT RESPONSE

Design a simple incident response plan.

Examples:

Compromised account

Accidental deletion

Lost survey device

Google Drive permission error

Database corruption

API abuse

Describe:

Detection

Containment

Recovery

Post-incident review

---

# PRIVACY

Design privacy practices.

Consent before survey

Photo permission

Data minimization

Retention period

Data deletion

Public transparency

Recommendations for privacy notice.

---

# SECURITY REVIEW

Review the entire architecture.

Identify:

Weak authentication

Excessive permissions

Sensitive endpoints

Insecure storage

Privacy risks

GIS risks

Google integration risks

Suggest improvements.

---

# DELIVERABLES

Generate:

1. Security Principles

2. Threat Model

3. Authentication Design

4. Authorization Matrix

5. Data Classification

6. GPS Privacy Guidelines

7. File Upload Security

8. API Security

9. Database Security

10. Google Integration Security

11. Offline Security

12. Logging & Audit

13. OWASP Review

14. Security Testing Plan

15. Incident Response Plan

16. Privacy Recommendations

17. Final Security Review

Everything should be implementation-ready.

---

# IMPORTANT

Do NOT write implementation code.

Do NOT generate firewall configurations.

Do NOT generate infrastructure scripts.

Focus on architecture, policy, and implementation guidance.

Wait for approval before Development Roadmap.

Karena proyek ini dipakai di lapangan dan melibatkan warga, aku menyarankan AI juga menambahkan tiga bagian berikut.

1. Data Consent & Etika Survei

Buat bagian khusus yang menjelaskan:

bagaimana meminta persetujuan warga sebelum wawancara,
kapan foto rumah boleh diambil,
bagaimana jika warga menolak,
data apa yang boleh dipublikasikan,
data apa yang hanya boleh dilihat tim KKN.

Ini bukan hanya soal keamanan, tetapi juga etika pengumpulan data.

2. Device Security Checklist

Karena survei dilakukan menggunakan ponsel pribadi mahasiswa, tambahkan checklist seperti:

gunakan kunci layar,
jangan bagikan akun,
logout setelah KKN selesai,
jangan menyimpan ekspor data di aplikasi chat,
hapus cache offline setelah sinkronisasi berhasil.

Bagian ini sangat praktis dan sering terlupakan.

3. Security Readiness Checklist

Sebelum aplikasi digunakan di lapangan, AI diminta membuat checklist seperti:

Semua akun sudah memiliki role.
RLS Supabase aktif.
Bucket Storage memiliki aturan akses yang benar.
API key tidak tersimpan di frontend.
Backup database berhasil diuji.
Google Drive menggunakan folder yang benar.
Sinkronisasi offline berhasil diuji.
File upload hanya menerima format yang diizinkan.

Checklist ini akan menjadi panduan akhir sebelum hari pertama survei.