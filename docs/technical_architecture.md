# KGVilla Technical Architecture Reference

This document provides a comprehensive overview of the technical stack for **KGVilla**, explaining the purpose of each component and the reasoning behind its selection.

---

## 1. High-Level Overview

KGVilla is a **Cloud-Native Web Application** built on **Google Cloud Platform (GCP)**. It uses a "Serverless" architecture, meaning we do not manage physical servers or VMs. This ensures:
- **Zero Cost at Rest:** If no one uses the app, the bill is $0.
- **Infinite Scalability:** It can handle 1 user or 10,000 users automatically.
- **Modern & Fast:** Uses the latest frameworks for optimal performance.

---

## 2. Frontend (The User Interface)

### **Technology: Next.js 16 (React)**
*   **What it is:** A modern React framework for building web applications.
*   **Why we use it:**
    *   **Performance:** It produces highly optimized static files that load instantly.
    *   **Structure:** The "App Router" forces a clean file structure (`src/app/qto/page.tsx`), making the code maintainable.
    *   **Ecosystem:** Huge library of pre-built components (like `lucide-react` icons) speeds up development.

### **Hosting: GitHub Pages**
*   **What it is:** A static site hosting service directly integrated with our code repository.
*   **Why we use it:**
    *   **Free & Simple:** Since our frontend is "Static Export" (no server-side rendering required for the UI logic), we don't need a paid server. GitHub hosts it for free.
    *   **CI/CD:** Every time we push code, GitHub Actions automatically builds and deploys the new version.

---

## 3. Backend (The "Brain")

### **Technology: Python FastAPI**
*   **What it is:** A high-performance web framework for building APIs with Python.
*   **Why we use it:**
    *   **AI Native:** Python is the language of AI. Using Python allows us to integrate Google's Vertex AI SDKs natively without complex bridges.
    *   **Speed:** FastAPI is one of the fastest Python frameworks available.
    *   **Type Safety:** It uses `Pydantic` models (like our `BoQItem` class), ensuring that the data we send to the frontend is always structured correctly.

### **Compute: Google Cloud Run**
*   **What it is:** A "Serverless Container" platform. It takes our Docker container and runs it on Google's infrastructure.
*   **Why we use it:**
    *   **Cost:** It has a generous free tier (2 million requests/month).
    *   **Simplicity:** We just give it a container image, and it gives us a secure HTTPS URL (`https://kgvilla-api...`). We don't worry about OS updates or security patches.

### **Containerization: Docker**
*   **What it is:** A tool that packages our code, Python version, and libraries into a standard "box" (Image).
*   **Why we use it:**
    *   **Consistency:** "It works on my machine" is a common bug. Docker ensures the code runs *exactly* the same on your laptop as it does in the cloud.
    *   **Portability:** We can move this container anywhere (GCP, AWS, Azure) if we ever need to.

### **Registry: Google Artifact Registry**
*   **What it is:** A private storage shelf for our Docker images.
*   **Why we use it:** Cloud Run needs a place to pull the container from. Artifact Registry is fast, secure, and integrated.

---

## 4. Artificial Intelligence (The Core Value)

### **Service: Google Vertex AI (Gemini 1.5 Pro)**
*   **What it is:** Google's state-of-the-art multimodal AI model.
*   **Why we use it:**
    *   **Multimodal:** It can "see" and "read" PDF floor plans directly. We don't need separate OCR (Optical Character Recognition) tools.
    *   **Context Window:** It has a huge memory (1M+ tokens), meaning we can feed it the *entire* set of Swedish Building Regulations (BBR) and ask it to cross-reference them against the drawing in a single prompt.
    *   **Cost:** The "Flash" version is extremely cheap for high-volume tasks, while "Pro" offers deep reasoning for complex architectural analysis.

---

## 5. Data & Storage

### **Database: Google Cloud Firestore (Upcoming)**
*   **What it is:** A NoSQL document database (like a giant JSON store).
*   **Why we use it:**
    *   **Flexibility:** Construction data is messy. A project might have 5 rooms or 50; some items have dimensions, others don't. A document store handles this variability better than a rigid SQL table.
    *   **Real-time:** It allows the frontend to listen for changes (e.g., "Analysis Complete") and update the UI instantly without refreshing.

### **File Storage: Google Cloud Storage (GCS) (Upcoming)**
*   **What it is:** An "Object Store" for files (like an unlimited hard drive in the cloud).
*   **Why we use it:** We need a secure place to store the user's uploaded PDF drawings before the AI reads them. It provides a unique URL for every file.

---

## 6. Architecture Diagram (Conceptual)

```mermaid
graph TD
    User[User (Browser)] -->|HTTPS| FE[Frontend (Next.js on GitHub Pages)]
    User -->|API Calls| API[Backend API (Cloud Run)]
    
    subgraph Google Cloud Platform
        API -->|1. Upload PDF| GCS[Cloud Storage Bucket]
        API -->|2. Analyze Image| AI[Vertex AI (Gemini 1.5)]
        API -->|3. Save/Read Data| DB[Firestore Database]
        
        AI -->|Reference| Docs[Swedish Standards Context]
    end
```
