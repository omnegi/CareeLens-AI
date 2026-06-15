# CareerLens AI 🚀
### AI-Powered ATS Resume Optimizer & Conversational Mock Interview Engine

CareerLens AI is a full-stack, enterprise-grade application designed to maximize a candidate's job application success rate. It operates as both a highly rigorous **Applicant Tracking System (ATS) Parser** and an interactive, real-time **Conversational Mock Interview Preparation Engine**. Utilizing the powerful **Gemini 1.5/2.0/3.5 models**, the application delivers near-instant, actionable feedback, keyword optimization, and real-time behavioral coaching.

---

## 🌟 Key Features

### 1. **ATS Resume Lab & Analyzer**
*   **Intelligent PDF Parsing:** Seamlessly handles uploaded resume files via a custom server-side Node PDF reading engine (`pdf-parse`).
*   **Rigorously Calibrated Scorecards:** Compares resumes against target job descriptions, providing an overall ATS match score weighted across Technical Stack Density (45%), Experiential Fit (35%), and Education/Credentials (20%).
*   **Visual Gap Analytics:** Identifies missing keywords, methodologies, and framework requirements with granular accuracy.
*   **Actionable STAR Enhancements:** Generates ready-to-use, impact-focused rewrite bullet points utilizing the **STAR Framework** with metric placeholders (e.g., `[quantify: metric/outcome]`).

### 2. **Conversational Mock Prep Engine**
*   **Adaptive Interview Persona:** Formulates highly targeted behavioral and architectural questions calibrated to the candidate's experience levels (ranging from entry-level to staff/principal titles).
*   **Interactive Vocal Simulation:** Features conversational text-to-speech synthesized flows paired with mic recording simulators to support comprehensive oral practice.
*   **Advanced Critique Dashboard:** Evaluates speech delivery and confidence parameters, flags verbal fillers (e.g., *um*, *ah*, *basically*, *you know*), and delivers a fully rewritten "Exemplar Answer" demonstrating how the response should be structured.
*   **Historical Archive Integration:** Syncs with **Firebase Firestore** to persist past interview sessions, allowing candidates to track score improvements over time.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18+ (TypeScript), Vite
*   **Styling Engine:** Tailwind CSS
*   **Backend Server:** Node.js, Express, `esbuild` for production bundling
*   **AI Integration:** `@google/genai` (Gemini 3.5 Flash Model)
*   **Cloud Persistence:** Firebase Firestore & Firebase Authentication
*   **Key Dependencies:** `lucide-react` (icons), `pdf-parse` (pdf extraction), `motion` (animations)

---

## ⚙️ Architecture Design

CareerLens AI employs a robust **Full-Stack Proxy Architecture** to protect sensitive API keys and handle memory-intensive document extraction safely:

```
┌────────────────────────────────┐
│         React Client           │
│   (Vite SPA, Tailwind CSS)     │
└───────────────┬────────────────┘
                │ HTTP Requests
                ▼ (No direct API keys in client)
┌────────────────────────────────┐
│      Express Node Gateway      │
│   (server.ts, CJS Production)  │
└───────────────┬────────────────┘
         ───────┼────────
        │       │        │
        ▼       ▼        ▼
 ┌──────────┐ ┌───────────┐ ┌───────────┐
 │PDF Parser│ │FireStore  │ │Gemini SDK │
 │(server)  │ │(Optional) │ │(Server-   |
 └──────────┘ └───────────┘ │ Side Only)│
                            └───────────┘
```

1.  **API Security:** All requests to Gemini undergo secure, server-side execution. The application enforces a zero-client-key footprint.
2.  **PDF Preprocessing:** Binary base64 streams are decoded and parsed cleanly on the backend using the Node native environment, ensuring fast processing times.
3.  **Unified Dev/Build Loop:** Uses Vite as middleware in development and serves static front-end assets directly from Node in production.

---

## 🚀 Setting Up the Project

### Prerequisites
*   Node.js (v18+)
*   NPM (v9+)

### Environment Configurations
Create a `.env` file (refer to `.env.example`) in the root directory:
```env
# Gemini API Key (Required for server-side endpoints)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation & Run Commands
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run Development Environment:**
    ```bash
    npm run dev
    ```
    *The app will boot natively on port 3000.*

3.  **Build production artifacts:**
    ```bash
    npm run build
    ```
    *Compiles React assets to `dist/` and compiles the Node backend using `esbuild` into a self-contained, enterprise-optimized `dist/server.cjs` file.*

4.  **Run Production Server:**
    ```bash
    npm run start
    ```

---

## 📈 Database Security

The firestore security rules enforce strict multi-tenant isolation:
*   Users can only read and write their own documents matching their authenticated `uid`.
*   Unauthenticated writes are blocked across all collections.
