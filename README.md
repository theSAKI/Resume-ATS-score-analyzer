# 🚀 AI Resume Analyzer (Production-Ready Developer's Guide)

Welcome to the **AI Resume Analyzer**, a full-stack, enterprise-grade professional assessment platform. This workbook outlines the system architecture, REST endpoints, data models, and customization strategies.

---

## 📂 Project Directory Structure

The application is structured as a self-contained, high-performance web applet, featuring an Express backend with on-the-fly PDF compilation, a React dashboard styled with Tailwind CSS, and a Gemini-powered core matching engine.

```text
├── .env.example              # Template for secret keys and local configs
├── .gitignore                # Production artifact and dependency exclusions
├── README.md                 # System documentation & CPRW handbook (This file)
├── index.html                # Vite client entry page
├── metadata.json             # AI Studio applet configurations
├── package.json              # Direct system dependencies and run-scripts
├── tsconfig.json             # TypeScript rules and path aliases
├── vite.config.ts            # Vite compiler hooks
├── server.ts                 # Full-stack Express server (PDF reader + Gemini SDK)
└── src/                      # Client React Source
    ├── App.tsx               # Primary dashboard layout and file coordinate state
    ├── index.css             # Tailwind v4 globals, custom scrollbars, and display fonts
    ├── main.tsx              # React mounting runtime
    ├── types.ts              # Declarations shared across full-stack JSON nodes
    └── components/           # Extracted modules
        ├── AtsGauge.tsx      # SVG animated compliance gauges
        ├── ScoreBreakdown.tsx# Linear bar metrics diagnostics
        ├── BeforeAfterSuggestion.tsx # Side-by-side CPRW bullet transformations
        └── ReportDownloader.tsx      # Multi-format report builder (HTML, TXT, JSON)
```

---

## 🗄️ Database Schemas & State Engines

This system utilizes a hybrid persistence matrix to protect candidate privacy while supporting interactive local history.

### 1. Transient Browser State (Active Environment)
Scans and comparisons are stored in client-side secure `localStorage` under `ats_analysis_history` with the following TypeScript schema matching `/src/types.ts`:

```typescript
export interface AnalysisHistoryItem {
  id: string;                  // Format: "hist_" + timestamp
  timestamp: string;           // ISO Time format
  fileName: string;            // Original uploaded PDF filename
  fileSize: string;            // Formatted file size string (e.g. "120 KB")
  jobDescriptionUsed?: string; // Pasted reference job summary (if any)
  analysis: ResumeAnalysisResult; // Diagnostic JSON returned by Express
}
```

### 2. Multi-Tenant Relational Schema (SQL / PostgreSQL)
For scaling this applet to a cloud multi-user platform, the following database schema matches the system's generated JSON structure:

```sql
-- Users and Accounts table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded Resumes metadata
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_kb INT NOT NULL,
    resume_text TEXT NOT NULL, -- Extracted raw textual code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ATS Evaluations and match feedback
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_description TEXT,
    ats_score INT NOT NULL CHECK (ats_score BETWEEN 0 AND 100),
    match_score INT NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    overall_summary TEXT NOT NULL,
    candidate_name VARCHAR(100),
    candidate_email VARCHAR(100),
    candidate_phone VARCHAR(50),
    candidate_location VARCHAR(100),
    candidate_title VARCHAR(150),
    ats_breakdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extracted Skills reference (Many-to-Many)
CREATE TABLE evaluation_skills (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_missing BOOLEAN DEFAULT FALSE, -- Tagged as gap
    is_matched BOOLEAN DEFAULT FALSE  -- Tagged as matched keyword
);

-- Before-and-After improvement bullet suggestions
CREATE TABLE improvement_suggestions (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL, -- e.g., 'Work Experience'
    passive_bullet TEXT NOT NULL,        -- Underperforming phrase
    metric_bullet TEXT NOT NULL,         -- Optimized formulation
    strategy_explanation TEXT NOT NULL   -- Rationale
);
```

---

## 🔌 API Endpoints Specifications

All API routes are served under the Express container on port `3000`.

### 1. `GET /api/health`
Checks backend parsing readiness and core system uptime.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-06-11T12:30:15.000Z"
  }
  ```

### 2. `POST /api/analyze-resume`
Extracts binary content, matches parameters, and builds a comprehensive clinical score report.
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Payload**:
  - `resume`: Binary file attachment (PDF only, up to 10MB)
  - `jobDescription`: Optional plain text string representing job requirements.
- **Response `200 OK`**: Returns a standardized `ResumeAnalysisResult` object (refer to variables in `/src/types.ts`).
- **Response `400 Bad Request`**: Received when omitting the resume attachment or uploading a scanned non-OCR file containing no characters.

---

## 🛠️ Local Development & Build Commands

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot Development Environment / Live Server**:
   ```bash
   npm run dev
   ```
   Runs a local Express server on `http://localhost:3000` executing concurrent Vite HMR middlewares in rendering pages.

3. **Compile Production Bundle**:
   ```bash
   npm run build
   ```
   Compiles static code in `/dist` and uses `esbuild` to compile our ESM Express backend to a deployment CJS container `dist/server.cjs`.

4. **Boot Production Server**:
   ```bash
   npm run start
   ```

---

## 📝 Certified Resume Bullet Point Formulas (CPRW Blueprint)

When translating bullet points, the analyzer applies the high-conversion **X-Y-Z formula** popularized by Google: *"Accomplished [X], as measured by [Y], by doing [Z]"*.

### 💻 Left Column: Weak/Passive Phrasings ➡️ Right Column: High-Impact Upgrades
- ❌ *"Responsible for maintaining the database system."*
  ➡️ **"Decreased database query response latency by 42% through query indexing and structural column caching, ensuring peak server availability during high-traffic load cycles."**
- ❌ *"Collaborated on developing the frontend."*
  ➡️ **"Engineered 14 responsive screen views using React and Tailwind, improving client loading speeds by 1.8 seconds and boosting mobile user retention by 28%."**
- ❌ *"Worked as product lead on core app features."*
  ➡️ **"Pioneered a cross-functional roadmap comprising 5 engineers across 3 feature iterations, resulting in a 41% elevation in monthly active user activation."**
- ❌ *"Assisted on manual test operations."*
  ➡️ **"Architected a comprehensive automated end-to-end testing suite spanning Cypress and CI/CD pipelines, lowering QA escaping defects by 75%."**
- ❌ *"Did graphical design and branding support."*
  ➡️ **"Redesigned the onboarding visual funnel, cutting initial registration attrition by 34% through clean hierarchy and progressive disclosure patterns."**
