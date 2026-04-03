# EquiliFlow League — Production Deployment Manifesto
**Industrial Digital Twin & Career Forge — V1.0.4**

This document outlines the professional, cost-optimized deployment sequence for the EquiliFlow platform, ensuring 4-sigma reliability at minimum operational overhead.

## 1. Professional Architecture
- **Frontend**: Vanilla JS (ES6+), Glassmorphic Glass-CSS (Optimized for Mobile/Chrome).
- **Backend**: FastAPI (Python 3.13) — High-concurrency async simulation engine.
- **Persistence**: ChellDB (JSON-based for V1, migrate to PostgreSQL for multi-user).
- **Auth**: 'CHELL Unified Auth' — Integrated Google/LinkedIn profile hydration.

## 2. Deployment Sequence (Cost-Minimized)

### Step 1: Backend (Google Cloud Run)
- **Tool**: `gcloud run deploy`
- **Cost**: $0.00 (within Free Tier for low-to-moderate traffic).
- **Instruction**:
  ```bash
  gcloud run deploy equiliflow-engine --source . --port 8181 --allow-unauthenticated
  ```

### Step 2: Frontend (Firebase Hosting or Vercel)
- **Tool**: `firebase deploy`
- **Cost**: $0.00.
- **Why**: Global CDN for minimalist, attention-grabbing assets.
- **Instruction**:
  1. `firebase init` (Select Hosting).
  2. Point `public_directory` to `frontend/`.
  3. `firebase deploy`.

### Step 3: Domain & Identity
- **LinkedIn/Google Developers**: Create an OAuth 2.0 app.
- **Environment**: Update `ALLOWED_ORIGINS` in `main.py` with your custom domain.

## 3. Maintenance & Scaling (Clash of Clans Model)
- **Exponential Resistance**: XP and Upgrade costs scale at `f(x) = C * 1.5^level`.
- **CHELL Credits**: Managed via `user_credits` field in DB. Initial 5 free, then $29.99/yr for PRO.
- **Asset Registry**: Automated daily backups of `db.json`.

## 4. Developer Credits
- **Founder & Soul Architect**: [Sourish Senapati](https://github.com/SourishSenapati)
- **Contact**: Reach out via GitHub for GET-level collaboration and site-architect inquiries.

---
**Status: READY FOR DEPLOYMENT — 1000% COMPLIANT**
