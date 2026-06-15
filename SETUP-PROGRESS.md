# Training App — Setup Progress

## What Was Done

### 1. Git Repository Initialized
- `git init` run in `c:\Users\davidweiner\Training App`
- All project files committed in two commits:
  - `Initial commit: HLS New Hire Training App`
  - `Add GitHub Pages deployment workflow and SPA routing`

### 2. GitHub Pages Support Added
- **`frontend/vite.config.ts`** — updated to use `/training-app/` as base path when `GITHUB_PAGES=true` env var is set
- **`frontend/public/404.html`** — created as SPA deep-link fallback (redirects unknown paths back to index.html)
- **`frontend/index.html`** — added script to restore path from the 404.html redirect

### 3. GitHub Actions Workflow Created
- **`.github/workflows/deploy-pages.yml`** — builds the frontend and deploys to GitHub Pages on every push to `main`
- The existing **`.github/workflows/ci.yml`** (Azure Static Web Apps deploy) was left untouched

---

## What Still Needs To Be Done

### Step 1 — Create GitHub Repo (browser, 2 min)
1. Go to **https://github.com/new**
2. Set:
   - **Repository name**: `training-app`
   - **Visibility**: Private
   - **Do NOT** add README, .gitignore, or license
3. Click **Create repository**
4. Copy the repo URL shown (e.g. `https://github.com/YOUR-USERNAME/training-app.git`)

### Step 2 — Push Code (terminal)
Replace `YOUR-USERNAME` with your actual GitHub username (no underscores — check at https://github.com/settings/profile):

```powershell
cd "c:\Users\davidweiner\Training App"
git remote add origin https://github.com/YOUR-USERNAME/training-app.git
git branch -M main
git push -u origin main
```

Git will open a browser window to authenticate — no admin rights needed.

### Step 3 — Add GitHub Secrets
In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `VITE_AZURE_CLIENT_ID` | Your Azure Entra app client ID |
| `VITE_AZURE_TENANT_ID` | Your Azure Entra tenant ID |
| `VITE_API_BASE_URL` | URL of your deployed backend (or leave blank for now) |
| `VITE_PVA_BOT_URL` | Copilot Studio bot URL (optional) |

### Step 4 — Enable GitHub Pages
In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**

### Step 5 — Update Azure Entra Redirect URI
In [portal.azure.com](https://portal.azure.com) → App Registrations → your app → Authentication → Add redirect URI:
```
https://YOUR-USERNAME.github.io/training-app/
```

---

## Result
After the push, the Actions workflow runs automatically. The app will be live at:
```
https://YOUR-USERNAME.github.io/training-app/
```

> **Note:** The backend (Node.js/Express) does NOT run on GitHub Pages — only the frontend is hosted there.
> API features require the backend deployed separately (Azure App Service, Railway, etc.).
> The login page and static UI will load fine without the backend.

---

## Local Dev (when .env files are set up)
```powershell
# Terminal 1 — backend
cd backend ; npm run dev

# Terminal 2 — frontend
cd frontend ; npm run dev
```
Frontend: http://localhost:3000  
Backend: http://localhost:4000

Both need `.env` files (copy from `.env.example` and fill in Azure values).
