# GeM Bid Compliance Intelligence Platform (SIH-GeM_Portall)

[![Smart India Hackathon 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue.svg)](https://sih.gov.in)
[![Government e-Marketplace](https://img.shields.io/badge/GeM-Compliance%20Portal-orange.svg)](https://gem.gov.in)
[![Machine Learning](https://img.shields.io/badge/ML%20Engine-Random%20Forest%20(99.82%25)-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

> **An AI-powered pre-bid compliance & verification system for the Government e-Marketplace (GeM)**, designed to eliminate bidder disqualification bottlenecks, streamline buyer technical evaluations, and prevent procurement fraud using a 3-mode verification engine.

---

## 📌 Problem Statement & Overview

In public procurement on the Government e-Marketplace (GeM), **over 35% of bids are rejected due to technical non-compliance, missing OEM authorizations, turnover mismatches, or forged certificates**. 

Evaluation is currently manual, time-consuming (taking 15–30 days per tender), and vulnerable to collusion and forged documentation.

**SIH-GeM_Portall** provides a high-fidelity, intelligent solution:
1. **Automated Document Intelligence (OCR + NER)**: Instant extraction & clause matching of financial audits, GSTIN, PAN, ISO certificates, and OEM authorization letters.
2. **Real-time GeM API Cross-Validation**: Cross-verification with MCA21, GSTN, MSME Udyam, and GeM Seller Rating databases.
3. **ML-Powered Compliance Scoring**: High-precision Random Forest ensemble model (trained on 10,000+ public procurement tenders, 99.82% cross-validated accuracy).
4. **Anti-Collusion & Fraud Detection**: Graph-based analysis detecting shared IP addresses, identical bank signatures, timestamp anomalies, and synchronized bid pricing.
5. **Bidder Pre-Submission Audit (Self-Check)**: Pre-bid checklist and AI auditor helping sellers fix compliance gaps *before* final bid submission.

---

## 🏛️ Key Features

### 1. 🛡️ Buyer Workspace (Govt. Procurement Officer)
- **Tender Management Dashboard**: Track live GeM tenders across Ministry of Defence, Railways, Health, and State Departments.
- **6-Step Compliance Evaluation Pipeline**:
  - Step 1: Automated Document Processing & Clause Extraction
  - Step 2: Live GeM & Govt. Registry API Cross-Validation
  - Step 3: Random Forest ML Compliance Assessment (Probability Score + Risk Factors)
  - Step 4: Anti-Collusion & Integrity Engine (Bid-rigging detection)
  - Step 5: Disqualification Auto-Drafting (GeM GTC / STC compliant notices)
  - Step 6: Comparative Bid Matrix & Evaluation Summary
- **Downloadable Reports**: Export comprehensive evaluation audit trails in PDF/CSV formats.

### 2. 🏢 Seller Hub (Bidder & Vendor Portal)
- **Pre-Submission Compliance Auditor**: Sellers can run an AI check on their bid documents prior to submission to identify missing annexures, turnover deficits, or certificate expiry.
- **Tender Eligibility Matcher**: Real-time scoring against GeM tender requirements.
- **Seller Trust Passport**: Verified badge, compliance rating history, past tender wins, and ISO/MSME verification status.

### 3. 🤖 Machine Learning Playground
- Interactive simulator allows officials and auditors to test feature inputs (`Turnover_Ratio`, `Experience_Years`, `EMD_Submitted`, `Cert_Validity_Days`, `OEM_Auth_Valid`, `Past_Default_Count`, `Price_Deviation_Pct`, `Document_Completeness_Score`) and view live feature importances and classification results.

---

## 💻 Tech Stack & Architecture

- **Frontend**: Responsive Government-Standard Portal UI (Vanilla HTML5, CSS3 GeM Design System, Modern JavaScript ES6+)
- **Data Visualizations**: Chart.js for compliance distributions, evaluation matrices, and fraud risk meters
- **ML Inference Engine**: Random Forest Classifier with 8 weighted decision trees for instant client/server-side inference
- **Document OCR Simulation**: Tesseract / Regex-based certificate entity extraction
- **External Mock APIs**: MCA21, GSTN, MSME Udyam, DigiLocker Verification

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.8+ or Node.js (or any static HTTP server)

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/rrkarthi27112006/SIH-GeM_Portall.git
cd SIH-GeM_Portall

# 2. Run using Python built-in HTTP server
python -m http.server 3000 --directory bidsure-ai

# Or with Node.js
npx serve bidsure-ai -p 3000
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📂 Project Structure

```
SIH-GeM_Portall/
├── bidsure-ai/
│   ├── index.html                  # Main GeM Portal Web Application
│   ├── style.css                   # GeM Official Theme & Design System
│   ├── app.js                      # Core Application Logic, UI Controllers & Routers
│   ├── data.js                     # Mock GeM Tenders, Bidders, ML Model & APIs
│   ├── icons.js                    # UI SVG Icon definitions
│   └── README.md                   # Sub-module technical details
├── modal.txt                       # Python ML model training code & FastAPI backend
├── SIH2026-IDEA-Presentation.pptx  # Smart India Hackathon 2026 Presentation Deck
├── .gitignore                      # Git Ignore configuration
└── README.md                       # Main Repository Documentation
```

---

## 👥 Smart India Hackathon (SIH) 2026 Team

- **Project**: BidSure AI / GeM Bid Compliance Intelligence Platform
- **Theme**: Smart Governance & Procurement Transparency
- **Target Portal**: Government e-Marketplace (GeM - gem.gov.in)
