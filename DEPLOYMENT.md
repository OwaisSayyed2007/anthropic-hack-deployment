# Deployment Guide - FIWB Platform

Follow these steps to deploy your Digital Twin platform.

## 1. Backend (Railway)
Railway will host your FastAPI server and PostgreSQL database.

### Steps:
1.  **Create a New Project**: Go to [Railway.app](https://railway.app) and create a new project.
2.  **Add PostgreSQL**: Click "New" -> "Database" -> "Add PostgreSQL".
3.  **Deploy Backend**:
    *   Connect your GitHub repository.
    *   Set the **Root Directory** to `backend`.
    *   Railway will automatically find the `Procfile` and `requirements.txt`.
4.  **Set Environment Variables**: In the "Variables" tab of your backend service, add:
    *   `DATABASE_URL`: (Railway will automatically provide this if you added PostgreSQL).
    *   `GEMINI_API_KEY`: Your Gemini key.
    *   `SUPERMEMORY_API_KEY`: Your Supermemory key.
    *   `SUPERMEMORY_URL`: `https://api.supermemory.ai`
    *   `LLM_PROVIDER`: `gemini`
5.  **Get Your Backend URL**: Once deployed, Railway will give you a URL (e.g., `https://backend-production.up.railway.app`). **Save this for the frontend step.**

---

## 2. Frontend (Vercel)
Vercel will host your Next.js application.

### Steps:
1.  **Create a New Project**: Go to [Vercel.com](https://vercel.com) and import your GitHub repository.
2.  **Configure Project**:
    *   Set the **Root Directory** to `frontend`.
    *   Vercel will detect it as a Next.js project.
3.  **Set Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Use the **Backend URL** you got from Railway (e.g., `https://your-backend.up.railway.app`).
4.  **Deploy**: Click "Deploy".

---

## 3. Post-Deployment Update
Once your frontend is deployed (e.g., `https://fiwb-app.vercel.app`), you **MUST** update your Backend CORS settings.

1.  Go back to **Railway** -> **Backend Service** -> **Variables**.
2.  Add a new variable:
    *   `FRONTEND_URL`: `https://your-frontend.vercel.app`
3.  The backend will automatically restart and allow requests from your new frontend.

### Important Notes:
*   **Database**: I have updated the code to automatically handle PostgreSQL. The first time the backend starts on Railway, it will create all necessary tables.
*   **Simple Auth**: Your static logins (`student`/`123`, `teacher`/`123`) will work immediately.
