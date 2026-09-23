# LibraX — Modern Library Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![Gemini AI](https://img.shields.io/badge/AI%20Assistant-Gemini%203.8%20Flash-4285F4.svg)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

A production-ready, full-stack Progressive Web App (PWA) and Library Management System built for schools, universities, and institutions. Features comprehensive book cataloging, student member management, book circulation, due-date tracking, automated fine calculations, and a context-aware AI Library Copilot powered by Google Gemini.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup & Migration](#-database-setup--migration)
- [API Documentation](#-api-documentation)
- [Running Tests](#-running-tests)
- [Production Deployment](#-production-deployment)
  - [Option A: Google Cloud Run / Container](#option-a-google-cloud-run--docker)
  - [Option B: Node.js PaaS (Render, Railway, Heroku)](#option-b-nodejs-paas-render-railway)
  - [Option C: AI Studio Environment](#option-c-ai-studio-environment)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## 🚀 Key Features

- **📚 FR-01: Book Management**: Real-time catalog inventory, multi-criteria search (title, author, category), real-time stock counters, and addition of new titles with cover thumbnails.
- **🔄 FR-02: Issue Book**: Seamless book checkout linking student members to book IDs with automatic inventory status updates (`available` → `issued`).
- **📥 FR-03: Return Book**: 1-click book return workflows resetting status to `available` and updating student circulation balances.
- **👥 FR-04: Student Member Management**: Student directory with department filtering, ID indexing (`LIB001` format), active borrower counters, and member registration.
- **⏰ FR-05: Due Date & Overdue Tracking**: Real-time due date tracking with status badges (`active`, `due-soon`, `overdue`), automatic deadline alerts, and overdue day counting.
- **💰 FR-06: Fine Calculation**: Automated daily penalty calculation (₹5/day standard policy), fine records management, and pending balance tracking.
- **🤖 Grounded AI Library Copilot**: Embedded AI assistant powered by Google Gemini (`gemini-3.8-flash`) grounded with live database inventory, member history, and fine queries with automatic local engine fallback.
- **📱 Progressive Web App (PWA)**: Compliant Web App Manifest, Service Worker caching (Stale-While-Revalidate and Network-First API fallback), offline access support, and native home-screen installability across Android, iOS Safari, and Desktop.

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│            Progressive Web App Client (PWA)            │
│   • HTML5 / Modern CSS / Vanilla ES6 Modular Script    │
│   • Service Worker (sw.js) for Offline Caching         │
│   • Web App Manifest & Maskable Icon Assets            │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST / JSON
                           ▼
┌────────────────────────────────────────────────────────┐
│            Node.js / Express Application Server        │
│   • REST API Routes (/api/books, /api/members, etc.)   │
│   • Security Headers (nosniff, XSS protection, CORS)   │
│   • Container Health Probes (/health, /healthz)        │
│   • Dynamic Port Binding (process.env.PORT || 3000)    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│  Supabase PostgreSQL DB   │  │   Google Gemini API     │
│  • books                  │  │   • gemini-3.8-flash    │
│  • members                │  │   • Real-time Grounding │
│  • book_issues            │  │   • Local Fallback Engine│
│  • fines                  │  └─────────────────────────┘
│  • Row-Level Security     │
└───────────────────────────┘
```

---

## 💻 Technology Stack

- **Runtime & Server**: Node.js (v20+ recommended), Express 4.x (ES Modules)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) with transparent local persistence fallback
- **Artificial Intelligence**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash`
- **Frontend**: Responsive CSS, modern glassmorphism UI, Font Awesome 6, Inter/Poppins typography
- **PWA & Offline**: Native Service Worker API, Cache Storage API, Web App Manifest
- **Testing**: Node.js Native Test Runner (`node:test`, `node:assert/strict`)

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm** or **bun** / **yarn**
- *(Optional for Cloud DB)*: Free [Supabase](https://supabase.com) account
- *(Optional for AI)*: [Google AI Studio API Key](https://aistudio.google.com/)

---

## 🛠 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/library-management-system.git
cd library-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` with your credentials (see below).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | HTTP port the server binds to | No | `3000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | No | `production` |
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xyz.supabase.co`) | Optional | In-memory DB |
| `SUPABASE_ANON_KEY` | Supabase public anonymous API key | Optional | In-memory DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key (server-side only) | Optional | In-memory DB |
| `GEMINI_API_KEY` | Google Gemini API key for AI Assistant | Optional | Local rule engine |

> **Note on Zero-Config Mode:** The application is architected to run immediately out-of-the-box without external keys using an in-memory data store with all SRS seed records and a rule-based AI knowledge engine. When Supabase or Gemini keys are provided in `.env`, the system automatically upgrades to cloud persistence and live LLM grounding.

---

## 🗄 Database Setup & Migration

To configure Supabase PostgreSQL:

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project.
3. Copy the contents of `supabase/schema.sql` and run the script. This creates:
   - `books` table with constraints and status tracking
   - `members` table with unique `member_id` indexing
   - `book_issues` table with foreign keys and cascade rules
   - `fines` table with penalty rate logic
   - Row-Level Security (RLS) policies
   - Seed data preserving all SRS baseline records
4. Copy the Project URL and Service Role or Anon Key into your `.env` file.

---

## 📡 API Documentation

### System Endpoints
- `GET /health`: Health probe returning uptime, status, and environment.
- `GET /api/status`: System status and database connection mode.
- `GET /api/stats`: Aggregated library statistics (inventory count, issued, overdue, fines).

### Book Management (FR-01)
- `GET /api/books?search=&filter=`: Query catalog with optional search term or status filter.
- `POST /api/books`: Add a new book title (`{ title, author, category, copies, cover_url }`).

### Student Members (FR-04)
- `GET /api/members?search=`: Query student member directory.
- `POST /api/members`: Register a new student (`{ member_id, name, department, email }`).

### Circulation & Due Dates (FR-02, FR-03, FR-05)
- `GET /api/issues?filter=`: Retrieve active, overdue, or returned issues.
- `POST /api/issues`: Issue a book (`{ book_id, book_title, member_id, member_name, issue_date, due_date }`).
- `POST /api/returns`: Process a book return (`{ book_title, return_date }`).

### Fines (FR-06)
- `POST /api/fines/calculate`: Calculate overdue penalties (`{ overdue_days, fine_per_day, member_name, book_title }`).

### Grounded AI Assistant
- `POST /api/ai/chat`: Query the library assistant (`{ message, conversationHistory }`).

---

## 🧪 Running Tests

Execute the comprehensive automated test suite:

```bash
npm test
```

The test runner validates:
1. Supabase schema integrity and foreign key constraints
2. Data migration and seed preservation
3. FR-01 Book management and search
4. FR-04 Student member management
5. FR-02 & FR-05 Book issue and due-date tracking
6. FR-03 Book returns and inventory synchronization
7. FR-06 Fine calculations
8. System health and diagnostic counters
9. Grounded AI Assistant query handling

---

## 🚀 Production Deployment

### Option A: Google Cloud Run / Docker

1. Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
```

2. Build and deploy to Google Cloud Run:
```bash
gcloud run deploy library-management-system \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Option B: Node.js PaaS (Render / Railway / Heroku)

1. Connect your GitHub repository to Render/Railway.
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables in the service dashboard (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`).

### Option C: AI Studio Environment

The application compiles via `npm run build` and runs on port `3000`.

---

## 🔒 Security & Best Practices

- **Zero Secret Leakage**: No API keys or tokens are stored in the frontend or committed to source control.
- **Row Level Security (RLS)**: PostgreSQL tables are configured with RLS policies in `supabase/schema.sql`.
- **Security Headers**: Standard defense-in-depth headers applied on all responses (`X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy`).
- **Input Validation**: Backend sanitization on all POST endpoints preventing bad input mutations.
- **Fail-Safe Operation**: If external services (Supabase or Gemini) experience latency or downtime, the application seamlessly falls back to resilient local operations.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
