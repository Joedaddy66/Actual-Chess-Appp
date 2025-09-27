# Governed AI Reference Implementation — Chess Control Tower

**This is not just a chess app.**  
This repository is a reference implementation for **governed, zero-touch AI deployment**—demonstrating live, policy-driven automation, telemetry, and security in a real-time, user-facing system.

## What is This?

This project combines a modern AI-powered chess UI with a backend governance adapter, proving the operational KPIs and architectural patterns required for production AI deployment:

- **Zero-Trust Security:** Every move, every API call, is authenticated and governed (Firebase JWT enforced).
- **Live Policy Enforcement:** The system enforces cost/carbon/resource policies on every inference, demonstrating runtime governance.
- **Real-Time Telemetry:** Cost-per-move, carbon emissions, and error rates are tracked in real time and surfaced to the user.
- **Enterprise Readiness:** All API calls are routed through a secure wrapper; no hardcoded endpoints; all state is telemetry-driven.

## Why Use This?

- **Blueprint for AI at Scale:** Copy these patterns for any governed AI deployment—risk, cost, and compliance are no longer afterthoughts.
- **Live Proof-of-Value:** Not a slide deck. Not a static demo. This is running code with real metrics.
- **Extensible:** Swap out the chess engine for any AI model. Keep the governance and telemetry.

---

## 📄 One-Pager: Doctrine, Architecture, KPIs

### Doctrine

- **Governance-by-Default:** All production AI must be auditable, enforce cost/resource/ethics policies, and surface its own "health" in real time.
- **Zero-Touch Automation:** Pipelines, deployment, and policy enforcement require no manual intervention.
- **User-Visible Value:** Business KPIs (cost, carbon, latency) are always visible to stakeholders.

### Architecture

- **Frontend:** 3D Chess UI. React. Polls `/v1/monitor/telemetry` for live metrics.
- **Backend Adapter:** FastAPI (Python) with OPA/Rego policy checks, SQL telemetry, and JWT auth.
- **CI/CD:** Automated, policy-gated, and ready for zero-touch deployment.
- **Security:** All API calls require Firebase ID Token (JWT).

### KPIs

| Metric                | Target          | Description                      |
|-----------------------|----------------|----------------------------------|
| RTT (latency)         | <10 ms         | 99th percentile, move inference  |
| Cost per move         | < $0.01        | Real-time, per-inference         |
| Carbon per move       | < 0.1g CO₂     | Real-time, per-inference         |
| Security              | 100% JWT auth  | Zero direct, unauthenticated API |
| Policy Compliance     | 100% enforced  | Rego/OPA gate before deploy/exec |

---

## 🚀 Live Demo

**Frontend:** [Live Chess UI](https://your-frontend-url.com)  
**Backend API:** [Adapter Endpoint](https://your-backend-url.com)  
*(Replace with your deployed URLs.)*

---

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Quick Start

```sh
# 1. Clone and install
git clone https://github.com/Joedaddy66/Actual-Chess-Appp.git
cd Actual-Chess-Appp
npm install

# 2. Set environment variables (see .env.example)
# REACT_APP_ADAPTER_API_BASE=https://your-backend-url.com

# 3. Run in dev mode
npm run dev
```

---

## Build for Production

To build the application for production deployment:

```bash
# Build the application
npm run build

# Clean build (removes previous build artifacts)
npm run build:clean

# Build and preview locally
npm run preview:build
```

The build process will:
- Create optimized, minified production files in the `dist/` directory
- Generate separate chunks for vendor libraries and API dependencies
- Optimize assets for better caching and loading performance

Build artifacts:
- `dist/index.html` - Main HTML file
- `dist/assets/` - Optimized JavaScript and CSS files

---

## About

Built and maintained by @Joedaddy66.  
Design doctrine and reference implementation by the Obsidian Control Nexus.
