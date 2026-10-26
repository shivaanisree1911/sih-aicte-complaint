# Step-by-Step: Deploy Backend to Render & Frontend to Vercel

Follow these steps in order. It takes about 4–5 minutes total.

---

## 🟢 PART 1: Push Project to GitHub

Open VS Code (or PowerShell in the project folder) and run:

```bash
git init
git add .
git commit -m "Deploy College Complaint Portal"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

---

## 🟢 PART 2: Deploy Backend to Render (Do this first)

1. Go to **[dashboard.render.com](https://dashboard.render.com)** and log in.
2. Click **"New +"** (top right) → **"Web Service"**.
3. Select your GitHub repository.
4. Fill in these exact settings:
   - **Name:** `college-complaint-api` (or any name you like)
   - **Region:** `Singapore` (fastest for India)
   - **Branch:** `main`
   - **Root Directory:** `server`  *(⚠️ Important: type `server` here)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. Scroll down to **"Environment Variables"** and add these 4 keys:

   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://shivaanisree1911_db_user:Yub2qXmeOx4pC9iK@cluster0.tnq3ryc.mongodb.net/aicte_complaints?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `aicte_central_sentinel_auth_key_2026_production_vault` |
   | `NODE_ENV` | `production` |
   | `CORS_ALLOW_ALL` | `true` |

6. Click **"Deploy Web Service"**.
7. Wait ~2 minutes until Render shows **"Live"**.
8. **Copy your Render backend URL** from the top of the page (it will look like: `https://college-complaint-api.onrender.com`).

---

## 🟢 PART 3: Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Project Name:** `college-complaint-portal`
   - **Framework Preset:** `Vite` (it will auto-detect Vite)
   - **Root Directory:** Click **Edit** and select `client` *(⚠️ Important: select the `client` folder)*
   - Build and Output Settings: Leave as default (`npm run build` and `dist`).

5. Expand the **"Environment Variables"** section and add:

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://YOUR-BACKEND.onrender.com/api` *(Paste your Render URL followed by `/api`)* |

   > **Example:** If your Render backend is `https://college-complaint-api.onrender.com`, then value is:  
   > `https://college-complaint-api.onrender.com/api`

6. Click **"Deploy"**.
7. In ~1 minute, Vercel will finish and give you your live URL (e.g. `https://college-complaint-portal.vercel.app`).

---

## ✅ Done!
- Frontend is running on Vercel's global CDN.
- Backend is running on Render Node.js.
- Database is connected to your live MongoDB Atlas cluster.
- All student, teacher, and principal roles, email verification, and complaint logging will work live!
