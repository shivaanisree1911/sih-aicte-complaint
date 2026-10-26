# AICTE College Complaint Portal - Fast Deployment Guide

This guide gives you the fastest ways to deploy your application live to the web today.

---

## ⚡ Option 1: Render.com (Recommended — Quickest & Easiest)
Deploy both the Frontend and Backend together on a **single free Web Service** with zero CORS configuration!

### Step-by-Step Instructions:
1. **Push your code to GitHub**:
   - Create a new repository on [GitHub](https://github.com/new) (e.g. `college-complaint-portal`).
   - Push your project folder to GitHub:
     ```bash
     git init
     git add .
     git commit -m "Deploy College Complaint Portal"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/college-complaint-portal.git
     git push -u origin main
     ```

2. **Create a Free Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **"New +"** → **"Web Service"**.
   - Connect your GitHub repository.

3. **Configure the Service**:
   - **Name**: `college-complaint-portal`
   - **Environment**: `Node`
   - **Region**: `Singapore` (Fastest for India / Tamil Nadu)
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```

4. **Add Environment Variables** (Under "Environment" in Render):
   | Variable Key | Variable Value |
   | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://shivaanisree1911_db_user:Yub2qXmeOx4pC9iK@cluster0.tnq3ryc.mongodb.net/aicte_complaints?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `aicte_central_sentinel_auth_key_2026_production_vault` |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |

5. **Click "Deploy Web Service"**:
   - Render will automatically install packages, compile the Vite frontend, and start the Express server.
   - In 2–3 minutes, you will get a live public link (e.g. `https://college-complaint-portal.onrender.com`) that anyone can open in their browser!

---

## ⚡ Option 2: Railway.app (Alternative 1-Click Deploy)
1. Go to [railway.app](https://railway.app) and log in with GitHub.
2. Click **"New Project"** → **"Deploy from GitHub repo"**.
3. Select your repository.
4. Click on the service → **"Variables"** and add:
   - `MONGODB_URI`: `mongodb+srv://shivaanisree1911_db_user:Yub2qXmeOx4pC9iK@cluster0.tnq3ryc.mongodb.net/aicte_complaints?retryWrites=true&w=majority`
   - `JWT_SECRET`: `aicte_central_sentinel_auth_key_2026_production_vault`
   - `NODE_ENV`: `production`
5. Go to **"Settings"** → **"Generate Domain"**.
6. Railway builds and deploys your site live instantly!

---

## ⚡ Option 3: Vercel (Frontend) + Render (Backend)

If you prefer deploying the frontend on Vercel:

### 1. Deploy Backend on Render:
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Copy your Render backend URL (e.g. `https://my-backend.onrender.com`).

### 2. Deploy Frontend on Vercel:
- Go to [vercel.com](https://vercel.com) → **"Add New Project"**.
- Set **Root Directory** to `client`.
- Add an Environment Variable:
  - Key: `VITE_API_BASE_URL`
  - Value: `https://my-backend.onrender.com/api`
- Click **Deploy**.

---

## 🛡️ Pre-Configured Live MongoDB Cluster
Your cloud database is already connected, verified, and pre-seeded with all 25 Tamil Nadu colleges (including Thiagarajar College of Engineering). You do not need to create a new database cluster.
