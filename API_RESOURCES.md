# EquiliFlow Digital Twin — API & Resource Manifesto
**Graduate Engineering Trainee (GET) Infrastructure — Production V1.0.6**

To move this project from local simulation to a globally accessible industrial digital twin, you must provision the following cloud resources and API integrations.

## 1. Primary Accounts Required
| Service | Purpose | Cost Est. |
| :--- | :--- | :--- |
| **Google Cloud Platform (GCP)** | Hosting (Cloud Run) & Database (Cloud SQL) | $0.00 (Free Tier) |
| **GitHub** | Repository Management & CI/CD Actions | $0.00 |
| **Stripe Developer Portal** | 'CHELL PRO' Payment Gateway Integration | $0.00 |
| **Google Developers Console** | OAuth 2.0 (Google Login) Integration | $0.00 |
| **LinkedIn Developers** | OAuth 2.0 (LinkedIn Login) Integration | $0.00 |

## 2. API Implementation Roadmap

### A. Authentication (OAuth 2.0)
Currently, the 'CHELL' login is a high-fidelity simulation. For production:
- **Client ID / Secret**: Register your application at the [Google APIs console](https://console.cloud.google.com/).
- **Callback URI**: Standardize to `https://[your-domain]/auth/callback`.
- **User Database**: Migrate `db.json` to **PostgreSQL** or **Firebase Firestore** to support concurrent user profiles.

### B. Payment Gateway (Stripe)
The **Authorize Deployment** button in the PRO modal must connect to:
1. `stripe.checkout.sessions.create()` (Backend).
2. The user is redirected to a secure Stripe-hosted payment page.
3. **Webhook Listener**: A backend endpoint (e.g., `/api/v1/billing/webhook`) that listens for `checkout.session.completed` events to flip the `is_pro` bit in the database.

### C. PDF & PPT Generation
The **Portfolio Builder** and **PPT Generator** currently use local logic:
- **jspdf / html2canvas**: For client-side PDF exports of the student portfolio.
- **PptxGenJS**: For client-side PPT generation of reactor telemetry.

## 3. Deployment Topology
1. **GitHub Actions**: Automated `gcloud run deploy` on every push to `main` branch.
2. **Environment Variables**: Store sensitive keys (Stripe Secret, GCP Service Account) in GitHub Secrets.
3. **Domain SSL**: Use GCP Managed SSL for the `equiliflow.chell.engineering` (demo) domain.

---
**Status: READY FOR PROVISIONING — 1000% COMPLIANCE**
Designed by **Soul Architect**
