# 🏛️ CivicPath

**Maharashtra Municipal Permitting & Approval Navigator**  
*Deterministic Statutory Workflow Engine under UDCPR 2020 & MRTP Act 1966*

---

## 📌 1. Overview & Purpose

**CivicPath** is an interactive, civic-tech statutory navigator that deconstructs complex municipal building permission and development clearance pipelines in Maharashtra into an actionable, sequential **Directed Acyclic Graph (DAG)**.

Applying for building permissions in Maharashtra involves navigating multiple municipal departments (Land Records/TILR, Town Planning, CFO Fire Safety, Tree Authority, Hydraulic Engineering, Heritage Conservation, Aviation) and rigid statutory prerequisites. CivicPath transforms this bureaucratic complexity into a structured, transparent master dossier with clear dependency tracking.

---

## 🎯 2. Core Architecture & Regulatory Scope

### Supported Statutory Framework
- **State Regulation:** Unified Development Control and Promotion Regulations for Maharashtra (UDCPR 2020)
- **Primary Act:** Maharashtra Regional and Town Planning Act 1966 (MRTP Act 1966)
- **Revenue & Cadastral Laws:** Maharashtra Land Revenue Code 1966 (MLRC 1966)
- **Life Safety & Environmental Acts:** Maharashtra Fire Prevention and Life Safety Measures Act 2006, Maharashtra Protection & Preservation of Trees Act 1975

### Supported Construction Typologies (7 Categories)
1. **Residential:** Bungalows, G+2 houses, multi-family apartment buildings.
2. **Commercial:** Retail shops, office complexes, shopping centers (off-street parking & traffic circulation rules).
3. **Institutional:** Educational schools, colleges, healthcare clinics (barrier-free accessibility standards).
4. **Hospitality:** Hotels, resorts, guest houses (tourism policy & solid waste management schemes).
5. **Mixed-Use:** Commercial retail with upper residential apartments (mandatory egress & lift segregation).
6. **Industrial:** Factories, manufacturing plants, warehouses (MPCB Consent to Establish & DISH factory scrutiny).
7. **Other:** Custom civic building requirements evaluated with deterministic residential statutory fallbacks.

### Three-Tier Regulatory Engine
1. **Deterministic Eligibility Engine (`server/src/rules/eligibilityEngine.js`):**
   Evaluates plot parameters against exact statutory criteria and classifies departmental NOCs into `APPLIES`, `EXEMPT`, and `REQUIRES_VERIFICATION`.
2. **Strict Graph Sanitizer & Validator (`server/src/utils/graphValidator.js`):**
   Validates node schemas, stages, types, and edge endpoints to prevent malformed graphs or circular loops.
3. **AI Plain-Language Explainer (Gemini API):**
   Demystifies statutory jargon into clear citizen-friendly English without overriding deterministic rules. Operates with automatic failover to curated offline blueprints if offline or unconfigured.

---

## 🔒 3. Security & Safety Architecture

- **Server-Side API Key Secrecy:** Gemini API keys (`GEMINI_API_KEY`) remain strictly on the Node.js server and are never bundled into client assets or exposed in client responses.
- **SSRF Protection (`server/src/utils/urlValidator.js`):** The `/api/link-status` connectivity probe strictly validates against official government domains (`*.gov.in`, `*.nic.in`, `*.aai.aero`) and blocks DNS resolution to private IP subnets (RFC 1918, localhost, link-local `169.254.x.x`).
- **No Cloud Database / No External Trackers:** No user data is transmitted to third-party databases.

---

## 💾 4. Persistence Model Disclosure

CivicPath stores active session parameters, questionnaire inputs, and completed milestone progress **locally in the user's browser** via `localStorage` (key: `vertexa_active_session`).

**What CivicPath does NOT provide:**
- User accounts or login credentials
- Server-side project database storage
- Cross-device cloud synchronization

Clearing browser cache or resetting the session clears the local roadmap progress.

---

## ⚠️ 5. Regulatory Disclosure & Scope Boundaries

> **Informational Guidance Notice:**  
> CivicPath is an informational planning and workflow visualization tool. It does **not** constitute formal legal counsel, statutory certification, or a guaranteed municipal sanction.  
> 
> - **Indicative Metrics:** Turnaround times are indicative Maharashtra Right to Services (RTS) benchmarks. Fee figures are indicative municipal estimates; actual government charges scale according to municipal rate cards and built-up area calculations.  
> - **Empirical Site Verification:** Factors including heritage precinct buffer zones, airport radar Obstacle Limitation Surfaces (OLS), eco-sensitive zone notifications, high-tension power line clearances, and local Development Plan (DP) reservations require site-specific physical verification.  
> - **Non-Modeled Jurisdictions & Special Schemes:** Special Planning Authorities (e.g., MIDC industrial estates, CIDCO project areas, MHADA/SRA slum rehabilitation schemes, and Coastal Regulation Zones) operate under distinct development regulations outside standard UDCPR municipal corporation jurisdiction.  
> - **Licensed Professional Submission:** All formal proposals, PreDCR CAD drawings, and building sanction submissions must be prepared, signed, and submitted through a Council of Architecture (COA) registered architect or licensed structural engineer.

---

## 🛠️ 6. Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/civicpath.git
cd civicpath

# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

---

## ⚙️ 7. Environment Configuration

### Server Configuration (`server/.env`)
Copy the example environment template:
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```env
PORT=5000
NODE_ENV=production

# Optional Gemini API Key for dynamic plain-language explanations
GEMINI_API_KEY=your_server_side_key_here

# Optional Allowed Origins for strict CORS in production (leave unset for permissive)
# ALLOWED_ORIGINS=https://your-domain.com
```

### Client Configuration (`client/.env`)
For local development with the Vite proxy, no `.env` is required.  
For decoupled production hosting where the API is hosted on an external domain:
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🚀 8. Development & Production Commands

### Running Locally (Development Mode)
```bash
# Terminal 1: Start Express API server (Port 5000)
npm run dev:server

# Terminal 2: Start Vite Frontend (Port 5173 / 5174)
npm run dev:client
```

### Production Build & Standalone Serving
```bash
# 1. Compile the React client bundle
npm run build

# 2. Start the unified production Express server
npm start
```
*When `client/dist` is present, the Express server serves both the compiled Single Page Application (SPA) and `/api/*` endpoints on a single port (e.g. `http://localhost:5000`).*

### Running Automated Regression Tests
```bash
node server/test_api.js
```

---

## 🧪 9. Automated Regression Test Suite

The 19-point automated test suite verifies:
- Express `/api/health` operational status
- AAI NOCAS airport height clearance logic & verification-required boundary
- Heritage Conservation Committee review triggers
- Eco-Sensitive Zone (ESZ) / Matheran rules
- High-rise CFO Fire Safety 15.00m threshold boundaries
- Neutralized regulatory step titles
- Tree Authority preservation (>0 trees) vs. zero-tree exemption
- High-Tension power line & <6.0m road width verification classifications
- SSRF prevention & localhost rejection
- Custom residential request DAG generation
- Water connection & drainage scope handling
- Matrix verification of all **7 Construction Typologies**

---

## 📄 10. License

MIT License. Designed and engineered for transparent civic governance and public municipal literacy.
