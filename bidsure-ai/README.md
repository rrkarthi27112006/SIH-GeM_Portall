# BidVerify AI — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

**Smart India Hackathon (SIH) 2026 · Problem Statement ID: 26100 · Theme: Smart Automation · Team: BidNova**

BidVerify AI (BidSure AI) is a complete, high-impact public procurement intelligence platform developed for the Government e-Marketplace (GeM). It combines automated OCR ground-truth extraction, live multi-portal cross-verification, anti-collusion fraud screening, and a Random Forest Machine Learning classifier (evaluated on 200,000 bids with 99.82% accuracy) to evaluate bidder compliance while keeping the final statutory decision with the Procurement Officer.

---

## 🌟 Key Concepts & Architecture (from SIH 2026 Presentation)

### The 3-Mode Verification Engine:
1. **Mode 1: Automated Document Verification (OCR + AI Extraction)**
   - Visual interactive bounding boxes on scanned/digital certificates (GST REG-06, PAN Card, Udyam MSME, ITR-V, CA Turnover Certificates, MAF, and Work Orders).
   - Real-time confidence scores, extracted ground truth, and SHA-256 hash validation.
2. **Mode 2: Smart Cross-Portal Validation (Live/Mock Authorized Government APIs)**
   - Real-time cross-checks against **GSTN**, **Income Tax e-Filing (NSDL)**, **Ministry of MSME Udyam Registry**, **EPFO Shram Suvidha**, **MCA21 / ROC**, and the **GeM Debarment Watchlist**.
   - Interactive API Sandbox & payload inspector showing latency, request headers, and response JSON.
   - External portal web scraping cross-verification demo (matching `modal.txt` Cell 23–28).
3. **Mode 3: AI Compliance Assessment & Machine Learning Model (from `modal.txt`)**
   - Live Random Forest Classifier (100 Trees, 99.82% accuracy, weighted F1 99.82%).
   - Interactive parameter sliders & real-time inference playground.
   - Top 15 Feature Importances Bar Chart & 3x3 Confusion Matrix heatmap.
   - Mock FastAPI / REST API endpoint runner (`/verify_bidder/{bidder_name}`).

### Unique Value Propositions (UVPs):
- **Tender-to-Trust Intelligence**: Single unified compliance profile for every bidder submission.
- **Clause-to-Proof Mapping**: Direct link between tender clauses, bidder documents, and official registry evidence.
- **Digital Bidder Trust Passport**: Reusable verified compliance identity with Trust Index (0–100), verified badges, and printable credentials.
- **Anti-Collusion & Cartel Detector**: Network analysis detecting shared director DINs, synchronized IP submissions, and cover bidding.
- **Explainable AI (XAI)**: Evidence-backed reasoning with human-in-the-loop decision console.
- **Tamper-Evident Audit Trail**: Immutable cryptographic ledger tracking all AI actions and officer approvals.

---

## 🚀 How to Run Locally

No build step or heavy dependencies required. Built with clean Vanilla HTML, CSS, JavaScript, and Chart.js.

1. Open `bidsure-ai/` in your browser:
   - Double-click `bidsure-ai/index.html` to open directly in Chrome, Edge, or Firefox.
   - Or run with Live Server in VS Code.
   - Or start a local server:
     ```bash
     python -m http.server 3000 --directory bidsure-ai
     ```
     Navigate to `http://localhost:3000`.

---

## 👥 Dual-Persona Walkthrough

### 1. Procurement Officer Evaluation Console (Buyer Mode)
- **Dashboard**: Live GeM status, 5 KPI cards, compliance risk distribution charts, active tenders table, recent audit events.
- **Tenders View**: Clause-to-Proof checklist, bidder rankings, **Side-by-Side Comparison Matrix**.
- **Bidder Profile (6-Step In-Depth Workspace)**:
  1. *Corporate Master Profile* (MCA directors, 3-yr audited financials, GeM commendations).
  2. *Mode 1 Document OCR Inspector* (Interactive bounding box viewer).
  3. *Mode 2 Portal Cross-Checks* (Live API sandbox).
  4. *Mode 3 AI Risk Breakdown* (Score gap deductions & anti-cartel check).
  5. *Officer Decision Console* (Approve, Clarify, Reject, or Review).
  6. *Official GeM Bid Compliance Certificate* (Printable with QR code & digital seal).
- **Verification Queue**: Batch processing & risk-filtered triage.
- **AI Model Engine (`#/ml-model`)**: Interactive Random Forest playground, feature importances, confusion matrix, FastAPI simulation.
- **Anti-Collusion Hub (`#/risk`)**: Cartel cluster alerts and red flag indicators.
- **Audit Trail (`#/audit`)**: Cryptographic log of all transactions.

### 2. Bidder / Vendor Pre-Submission Portal
- **Pre-Bid Auditor (`#/bidder-self-check`)**: Upload bid package before submitting on GeM to check projected compliance score and catch missing documents (e.g. OEM MAF) in advance.
- **Digital Bidder Trust Passport (`#/trust-passport-view`)**: Reusable Trust ID, verified badges, and exportable certificate.
- **My Submissions (`#/my-submissions`)**: Real-time status tracking across tenders.
- **GeM Rulebook (`#/gem-rules`)**: Plain-language guides for Make in India Order 2017, MSME exemptions, and MAF requirements.

---

## 📂 Project Structure
- `index.html` — Main application shell, modal windows, and SEO/accessibility metadata.
- `style.css` — High-grade Government-FinTech design system, responsive grids, and print stylesheet.
- `data.js` — Comprehensive datasets, Random Forest inference engine, API payloads, and mock scraper database.
- `icons.js` — Clean stroke SVG icon library.
- `app.js` — Application controller, hash router, view renderers, and interactive simulation wizard.
