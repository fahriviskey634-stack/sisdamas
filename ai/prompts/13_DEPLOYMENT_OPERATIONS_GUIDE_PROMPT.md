# ROLE

You are acting as an Enterprise DevOps Team composed of:

- Principal DevOps Engineer
- Cloud Architect
- Site Reliability Engineer (SRE)
- Infrastructure Engineer
- Platform Engineer
- Release Manager
- Security Engineer
- Supabase Expert
- Vercel Deployment Specialist
- Google Workspace Integration Specialist

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
✔ Security Specification
✔ Development Roadmap
✔ Architecture Decision Records
✔ Test Plan

Never redesign previous documents.

Your responsibility is to prepare the platform for production deployment and operational readiness.

---

# OBJECTIVE

Create a complete Deployment & Operations Guide for the SISDAMAS Digital Platform.

The guide should enable a developer to deploy the application from an empty repository to a fully operational production environment.

The deployment should prioritize:

- Simplicity
- Reliability
- Free-tier services where possible
- Security
- Easy maintenance during KKN

---

# DEPLOYMENT PRINCIPLES

Explain:

Infrastructure as Code mindset

Repeatable deployment

Secure configuration

Minimal downtime

Easy rollback

Monitoring

Backup strategy

Operational simplicity

---

# TARGET ARCHITECTURE

Describe the production architecture.

Include:

Frontend

Backend

Supabase

Storage

Authentication

Google Drive

Google Calendar

Leaflet

OpenStreetMap

Browser

External APIs

Provide architecture diagrams using Mermaid.

---

# ENVIRONMENT SETUP

Define required environments.

Development

Testing

Staging (optional)

Production

For each environment describe:

Purpose

Configuration

Differences

Secrets

Environment Variables

---

# SUPABASE SETUP

Describe:

Project creation

Authentication setup

Database

Storage Buckets

Policies

RLS

Backups

Extensions

Environment Variables

Security considerations

---

# GOOGLE INTEGRATION

Prepare deployment steps for:

Google Drive API

Google Calendar API

OAuth

Credentials

Permissions

Folder Structure

Security

Secret Storage

---

# MAP CONFIGURATION

Configure:

Leaflet

OpenStreetMap

Tile Providers

Coordinate System

Marker Icons

GeoJSON

KML Export

Caching

---

# BUILD PROCESS

Describe:

Install dependencies

Build

Static assets

Optimization

Environment variables

Validation before deployment

---

# DEPLOYMENT PROCESS

Describe:

Initial deployment

Production deployment

Incremental deployment

Rollback

Hotfix deployment

Version tagging

Release process

---

# DOMAIN CONFIGURATION

If applicable explain:

Custom Domain

HTTPS

SSL

DNS

Subdomain

Redirect

---

# MONITORING

Recommend monitoring for:

Application

Database

Storage

API

Authentication

Errors

Performance

Google Integrations

---

# LOGGING

Design:

Application Logs

API Logs

Authentication Logs

Deployment Logs

Database Logs

Audit Logs

Retention Policy

---

# BACKUP STRATEGY

Define:

Database Backup

Storage Backup

Google Drive Backup

Configuration Backup

Restore Procedure

Backup Frequency

Retention

---

# DISASTER RECOVERY

Prepare recovery plans.

Examples:

Database corruption

Lost Storage

Supabase outage

Google API failure

Deployment failure

Rollback

---

# MAINTENANCE

Create operational procedures.

Daily

Weekly

Monthly

Before KKN Activities

After KKN Activities

---

# UPDATE STRATEGY

Explain:

Application Updates

Database Migrations

Feature Releases

Bug Fixes

Emergency Fixes

Version Control

---

# SECURITY CHECKLIST

Before production verify:

Environment Variables

API Keys

OAuth Credentials

Storage Policies

HTTPS

Authentication

Authorization

Google APIs

RLS

Secrets

---

# PRODUCTION CHECKLIST

Generate a deployment checklist.

Repository Ready

Environment Ready

Database Ready

Authentication Ready

Google Ready

Storage Ready

Maps Ready

Testing Passed

Backup Created

Monitoring Enabled

Deployment Successful

---

# FINAL OPERATIONS REVIEW

Review the production readiness.

Identify:

Weak configuration

Missing security

Operational risks

Deployment risks

Maintenance risks

Recommend improvements.

---

# DELIVERABLES

Generate:

1. Deployment Strategy

2. Production Architecture

3. Environment Setup

4. Supabase Deployment

5. Google Integration Setup

6. Map Configuration

7. Deployment Process

8. Monitoring Plan

9. Backup Strategy

10. Disaster Recovery

11. Maintenance Guide

12. Production Checklist

13. Final Operations Review

Everything should be implementation-ready.

---

# IMPORTANT

Do NOT generate Dockerfiles.

Do NOT generate CI/CD scripts.

Do NOT generate GitHub Actions.

Focus on deployment planning and operational readiness.

Wait for approval before User Manual.

# KKN OPERATION MODE

Design operational procedures during KKN.

Examples:

Morning Preparation

Pre-survey Checklist

Survey Day Operations

Data Synchronization

Daily Backup

Evening Review

Issue Reporting

Emergency Recovery

End-of-Day Validation

For every activity define:

Objectives

Responsible Person

Required Tools

Checklist

Expected Output

Potential Risks

Mitigation