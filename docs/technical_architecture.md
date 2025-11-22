# KGVilla Technical Reference

## 1. What is this project?
**KGVilla** is an intelligent tool for Swedish home builders. It allows users to upload a floor plan (PDF or Image) and instantly get a detailed **construction cost estimate** (Bill of Quantities).

It solves the problem of "How much will this house cost?" by using Artificial Intelligence (AI) to read the drawings just like a professional quantity surveyor would, but in seconds instead of days.

---

## 2. How does it work?

### Step 1: The User Interface (Frontend)
The user visits the website (`kgvilla.github.io`). They see a clean, app-like interface where they can view project details or chat with the AI.

### Step 2: The Analysis (Backend)
When the user uploads a floor plan in the "AI Analysis" tab, the file is sent to our **Cloud Brain**.
1.  The Brain (Python Server) receives the file.
2.  It loads the **Swedish Building Standards** (BBR, Säker Vatten) into its memory.
3.  It sends the file + the rules to **Google Gemini** (the AI).

### Step 3: The Result
The AI looks at the drawing and performs a "Chain of Thought" analysis:
1.  **Scale & Segment:** Measures pixels to real-world meters.
2.  **Infer Systems:** "See a kitchen? Add stove wiring and leakage trays." (Things not drawn but required).
3.  **Price Assemblies:** Applies 2025 unit rates for specific wall/floor recipes (e.g., Wet Room Wall vs Standard Wall).
4.  **Return Data:** Returns a structured JSON with a detailed cost breakdown.

---

## 3. Technical Decisions (The "Why")

We chose specific technologies to make this **fast, cheap, and scalable**.

### **Frontend: Next.js 16 (React)**
*   **Choice:** Next.js 16 (Static Export).
*   **Why:** It allows us to host the website for **free** on GitHub Pages. We don't need a dedicated server just to show the buttons and text. It's extremely fast because it loads as static files.
*   **State Management:** We use a custom hook `useProjectData` to manage the "Cost Items" (previously BoQ) and persist them to `localStorage`. This keeps the UI components clean.

### **Backend: Python FastAPI**
*   **Choice:** Python running on Google Cloud Run.
*   **Why:** Python is the native language of AI. We use **Cloud Run** (Serverless), which means the server **turns off** when no one is using it.
    *   *Cost:* $0/month when idle.
    *   *Performance:* Scales up automatically if 1,000 people visit at once.

### **AI Engine: Google Vertex AI (Gemini 1.5)**
*   **Choice:** Gemini 1.5 Flash.
*   **Why:** It is "Multimodal" (can see images directly) and has a huge memory context (can read the entire building code book in one go). "Flash" is the faster, cheaper version of the model, perfect for real-time chat.
*   **Assembly Inference:** We don't just OCR text; we use Gemini's reasoning to "infer" construction assemblies (layers of material) that aren't explicitly drawn, ensuring the price is realistic.
*   **Context Awareness:** The Chat system is project-aware. It loads the chat history specific to the active project ID from `localStorage` (`kgvilla-chat-[ID]`), allowing users to switch contexts seamlessly.

---

## 4. Architecture Diagram

```mermaid
graph TD
    subgraph User Device
        Browser[Web Browser]
    end

    subgraph "Frontend (GitHub Pages)"
        UI[React App (Next.js)]
        Nav[Navigation & Chat UI]
    end

    subgraph "Backend (Google Cloud)"
        API[Python API (Cloud Run)]
        AI[Vertex AI (Gemini 1.5)]
        Standards[Swedish Standards Docs]
    end

    Browser -->|1. Load Site| UI
    UI -->|2. User Uploads File| API
    API -->|3. Load Context| Standards
    API -->|4. Send Image + Rules| AI
    AI -->|5. Return Cost Data| API
    API -->|6. Return JSON| UI
    UI -->|7. Render Cost Cards| Browser
```

---

## 5. Optimization & Performance

We implemented several tricks to ensure the app is performant and cost-efficient:

1.  **Lazy Loading AI:** The backend server doesn't connect to the expensive AI services until the *exact moment* a user uploads a file. This makes the server start up in milliseconds.
2.  **Static Frontend:** The entire website is pre-built. There is no database query needed just to load the home page.
3.  **Defensive Coding:** The backend is designed to never crash even if the AI service is temporarily unreachable. It will gracefully tell the user "Service unavailable" rather than breaking the whole app.
4.  **Serverless Process Manager:** We use `gunicorn` with `uvicorn` workers. This allows the single container to handle multiple requests at once without getting blocked, maximizing the usage of the free tier CPU.