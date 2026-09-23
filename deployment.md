# BuiltTechies Deployment Guide

This guide deploys:

- **Frontend:** Vercel
- **Backend:** Render (recommended) or another Node.js host
- **Database/auth:** Supabase

The current backend is a long-running Express server. Deploy it separately
from the Vercel frontend. Do not deploy `src/server/server.js` as a Vercel
static frontend function without migrating the backend to serverless first.

## 1. Prepare the project

Run these commands from the repository root:

```bash
npm install
npm run build
node --check src/server/server.js
```

If the build fails, fix it before deploying.

Confirm that `.env.local` is ignored by Git:

```bash
git status --short
```

Never commit `.env.local`, API keys, or Supabase service-role keys.

## 2. Confirm your Supabase database

Complete your database setup first:

1. Open the Supabase project.
2. Run the required SQL/schema setup.
3. Confirm authentication providers and redirect URLs.
4. Copy the project URL.
5. Copy the publishable browser key.

You will add these values to Vercel as:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Do not use a Supabase service-role key as a `VITE_` variable.

## 3. Push the code to GitHub

```bash
git add .
git commit -m "Prepare production deployment"
git push origin main
```

If Git reports both `README.md` and `Readme.md`, keep only one README filename
in the repository because Windows treats them as the same path.

## 4. Deploy the backend on Render

Render is used here because the current Express server uses `app.listen()` and
handles multipart PDF/audio uploads.

### Create the service

1. Open [Render](https://render.com/) and sign in with GitHub.
2. Select **New → Web Service**.
3. Select the BuiltTechies repository.
4. Select the branch you deploy, normally `main`.
5. Use these settings:

```text
Runtime: Node
Root Directory: .
Build Command: npm install
Start Command: npm run server
```

6. Choose a region close to your users.
7. Create the service.

### Add backend environment variables

In Render, open **Environment → Environment Variables** and add:

```env
PORT=10000
CORS_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
GROQ_API_KEY=your_groq_key
GROQ_CHAT_MODEL=openai/gpt-oss-20b
GROQ_STT_MODEL=whisper-large-v3-turbo
TAVILY_API_KEY=your_tavily_key
GOOGLE_MAPS_API_KEY=optional_google_places_key
GOOGLE_SEARCH_API_KEY=optional_google_search_key
GOOGLE_SEARCH_ENGINE_ID=optional_google_engine_id
```

Do not add `VITE_` variables to the backend unless a backend route explicitly
needs them. The backend needs no Supabase browser variables for its current
routes.

### Get the backend URL

After Render deploys successfully, copy the service URL from the Render
dashboard. Do not open the example URL below literally; replace it with your
actual service URL. It will look similar to:

```text
https://builttechies-api.onrender.com
```

Open this exact URL in a browser:

```text
https://YOUR-ACTUAL-RENDER-SERVICE.onrender.com/health
```

Expected response:

```json
{"success":true,"service":"BuiltTechies API"}
```

If `/health` returns `404`, Render is serving an older commit, a different
service, or a different project root. Confirm the start command is exactly
`npm run server`, then trigger **Manual Deploy → Deploy latest commit**.

## 5. Deploy the frontend on Vercel

1. Open [Vercel](https://vercel.com/).
2. Select **Add New → Project**.
3. Import the BuiltTechies GitHub repository.
4. Set **Root Directory** to the repository root.
5. Use these build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Add frontend environment variables

In **Vercel → Project Settings → Environment Variables**, add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_GEOAPIFY_API_KEY=your_geoapify_key
VITE_API_URL=https://builttechies-api.onrender.com
```

Replace the API URL with the actual Render URL from step 4.

Select **Production**, and select **Preview** too if you want preview
deployments to work. Click **Deploy**.

Vercel reads `vercel.json` and serves `index.html` for React routes, so direct
refreshes of `/chatbot`, `/find-hospitals`, `/compare`, and `/team` continue to
work.

## 6. Connect the final frontend URL to the backend

After the first Vercel deployment, copy the production domain, for example:

```text
https://builttechies.vercel.app
```

Go back to Render and update:

```env
CORS_ORIGINS=https://builttechies.vercel.app
FRONTEND_URL=https://builttechies.vercel.app
```

For multiple allowed origins, separate them with commas:

```env
CORS_ORIGINS=http://localhost:5173,https://builttechies.vercel.app,https://preview-domain.vercel.app
```

Save the variable and redeploy/restart the Render service.

If the Vercel domain changes, update `CORS_ORIGINS` again.

## 7. Configure Supabase production redirects

In Supabase, open **Authentication → URL Configuration**:

1. Set the production Site URL to the Vercel URL.
2. Add the Vercel URL to the Redirect URLs list.
3. Keep `http://localhost:5173` for local development.
4. Add any preview URL only if preview authentication is required.

## 8. Configure Geoapify

1. Open the Geoapify dashboard.
2. Confirm Places API access is enabled.
3. Add the key as `VITE_GEOAPIFY_API_KEY` in Vercel.
4. Restrict the key to the production frontend domain where supported.
5. Redeploy Vercel after changing the variable.

## 9. Configure Groq and Tavily

### Groq

Add the Groq key only in Render:

```env
GROQ_API_KEY=...
GROQ_CHAT_MODEL=openai/gpt-oss-20b
GROQ_STT_MODEL=whisper-large-v3-turbo
```

This powers chatbot responses, voice transcription, and PDF analysis.

### Tavily

Add the Tavily key only in Render:

```env
TAVILY_API_KEY=...
```

Without Tavily, the application still loads, but source-backed hospital
research may return unavailable metrics.

## 10. Configure Google image services (optional)

The app can use Google Maps place photos when a valid Places API key is
configured:

1. Create/select a Google Cloud project.
2. Enable Places API and Places Photo API.
3. Create a server-side key.
4. Restrict it to the required APIs.
5. Add it only to Render as `GOOGLE_MAPS_API_KEY`.

Google Custom Search image results additionally require:

```env
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

Never put these server-side keys in Vercel `VITE_` variables.

## 11. Redeploy after environment changes

Environment variables are not retroactive:

- After changing a Vercel variable, create a new Vercel deployment.
- After changing a Render variable, restart or redeploy the Render service.

## 12. Test the deployed application

Run this checklist:

- [ ] Vercel homepage loads.
- [ ] Refreshing `/chatbot` works.
- [ ] Refreshing `/find-hospitals` works.
- [ ] Supabase login/profile features work.
- [ ] Hospital search returns facilities.
- [ ] Map tiles load.
- [ ] Hospital comparison opens.
- [ ] `/api/chat` returns an assistant response.
- [ ] Voice input works on the HTTPS Vercel domain.
- [ ] PDF upload reaches the backend.
- [ ] Hospital verification works.
- [ ] CORS errors are absent in browser DevTools.
- [ ] Google Maps images work when configured.

## Troubleshooting

### Frontend calls `localhost:5000`

Set the Vercel variable:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

Then redeploy Vercel. Vite embeds `VITE_*` values during the build.

### CORS error

Set the exact Vercel origin in Render:

```env
CORS_ORIGINS=https://your-project.vercel.app
```

Do not add a trailing slash. Restart Render after saving.

### Voice input fails

Use the HTTPS Vercel domain, allow microphone permission, and confirm that
`GROQ_API_KEY` exists in Render. Test `/api/transcribe` from the browser
Network panel.

### Research or chatbot request returns HTML

The frontend is pointing at the Vercel site instead of the backend. Check
`VITE_API_URL`, then redeploy Vercel.

### Render service crashes

Check Render logs. Common causes are a missing `GROQ_API_KEY`, an invalid
dependency install, or a start command other than `npm run server`.

### Google Maps image is unavailable

Confirm that Places API and Places Photo API are enabled, billing is active,
and `GOOGLE_MAPS_API_KEY` is configured on Render rather than Vercel.
