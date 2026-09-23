# BuiltTechies

BuiltTechies is a React/Vite healthcare navigation application. It helps users:

- Find nearby hospitals and healthcare facilities.
- Match facilities to a healthcare requirement.
- Compare selected facilities.
- Request source-backed hospital research.
- View public hospital images when available.
- Chat with an AI healthcare navigation assistant.
- Use voice transcription.
- Upload and analyze PDF medical reports.

## Tech stack
yooo

- React 19
- Vite
- React Router
- MapLibre GL
- Geoapify Places API
- Supabase
- Express
- Groq Chat and Speech-to-Text APIs
- Tavily web search
- Google Places and Google Custom Search Images APIs (optional)

## Project structure

```text
src/
  components/       Reusable UI components
  context/          Auth and hospital-search state
  data/             Static application data
  pages/            Route-level React pages
  services/         External frontend services
  server/           Express backend API
  App.jsx           Application routes
  main.jsx          React entry point
```

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A Geoapify API key
- A Groq API key for chat, report analysis, and voice transcription
- A Tavily API key for source-backed hospital research
- A Google Cloud project only if Google Maps or Google Images photos are required

## Install locally

```bash
npm install
```

Create a local environment file:

```bash
copy .env.example .env.local
```

Never commit `.env.local`. Replace every placeholder with your own credentials.

Start the frontend:

```bash
npm run dev
```

Start the backend in a second terminal:

```bash
npm run server
```

The Vite development server runs on `http://localhost:5173` and proxies `/api`
requests to `http://localhost:5000`.

## Environment variables

### Frontend variables

These variables are exposed to the browser and must use the `VITE_` prefix:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_GEOAPIFY_API_KEY=your_geoapify_key
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to the public URL of the deployed API, for
example:

```env
VITE_API_URL=https://builttechies-api.example.com
```

### Backend variables

These variables must stay server-side and must not use the `VITE_` prefix:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
GROQ_CHAT_MODEL=openai/gpt-oss-20b
GROQ_STT_MODEL=whisper-large-v3-turbo
TAVILY_API_KEY=your_tavily_api_key
```

Optional Google image variables:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_places_key
GOOGLE_SEARCH_API_KEY=your_google_custom_search_key
GOOGLE_SEARCH_ENGINE_ID=your_custom_search_engine_id
```

Google image variables are optional. The application uses public-source
fallbacks when they are not configured. Google Maps photos require the Places
API/Places Photo API and an appropriately restricted Google Cloud key.

## Important credential warning

Do not copy API keys from a committed `.env.example` or from source control.
If a real key has ever been committed or shared publicly, revoke it and create a
replacement before deploying. In particular:

- Restrict browser keys by production domain and API.
- Restrict server keys by API and server-side usage.
- Never put `GROQ_API_KEY` or `TAVILY_API_KEY` in a `VITE_` variable.
- Never expose private keys in client-side React code.

## Testing and validation

Run the production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Check the backend syntax:

```bash
node --check src/server/server.js
```

Preview the production frontend locally:

```bash
npm run preview
```

## Vercel deployment architecture

The repository currently contains:

1. A Vite frontend.
2. A long-running Express backend in `src/server/server.js`.

Deploy the frontend to Vercel. Deploy the Express backend to a service that
supports a persistent Node process, such as Render, Railway, Fly.io, or a
managed VM. Then point the Vercel frontend at the backend using `VITE_API_URL`.

The current Express server calls `app.listen(...)`, so it is not a Vercel
serverless function as-is. Do not deploy the current `src/server/server.js` as
a Vercel frontend project and expect `/api` routes to work.

## Deploy the frontend to Vercel

### 1. Push the project to GitHub

Commit and push the repository:

```bash
git add .
git commit -m "Prepare BuiltTechies for deployment"
git push origin main
```

Do not commit `.env.local`, credentials, build output, or uploaded files.

### 2. Import the repository

1. Open [Vercel](https://vercel.com/).
2. Select **Add New Project**.
3. Import the BuiltTechies GitHub repository.
4. Use the repository root as the project root.
5. Keep the framework preset as **Vite**.

### 3. Configure the frontend build

Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Add Vercel environment variables

In **Project Settings → Environment Variables**, add:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_GEOAPIFY_API_KEY
VITE_API_URL
```

Set `VITE_API_URL` to the deployed backend URL, not
`http://localhost:5000`. Add the variables separately for Preview and
Production if you use different environments.

### 5. Deploy

Click **Deploy**. Every push to the connected branch will create a new
deployment.

## Deploy the current backend

Use a Node service with the following settings:

```text
Build command: npm install
Start command: npm run server
Health URL: /
```

Set these backend environment variables in the service dashboard:

```env
PORT=5000
GROQ_API_KEY
GROQ_CHAT_MODEL
GROQ_STT_MODEL
TAVILY_API_KEY
GOOGLE_MAPS_API_KEY
GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_ENGINE_ID
```

The backend must listen on the platform-provided `PORT`. The frontend's
`VITE_API_URL` must match the public backend URL, for example:

```env
VITE_API_URL=https://builttechies-api.onrender.com
```

After changing `VITE_API_URL`, redeploy the Vercel frontend because Vite
embeds `VITE_*` variables during the build.

## Optional: make the backend Vercel-native

If the whole project must run on Vercel, migrate the Express routes into a
serverless entry point before deployment:

1. Move route registration into an exported Express app factory.
2. Remove `app.listen(...)` from the imported app module.
3. Add a Vercel function such as `api/index.js` that exports the app.
4. Add a `vercel.json` rewrite from `/api/:path*` to `/api`.
5. Test multipart uploads, PDF analysis, and speech transcription on Vercel.
6. Configure function duration and payload limits for file-processing routes.

This migration is separate from deploying the current frontend and backend;
the existing `npm run server` process should not be used as a Vercel function
without these changes.

## Supabase setup

1. Create a Supabase project.
2. Copy the project URL to `VITE_SUPABASE_URL`.
3. Copy the publishable/anonymous browser key to
   `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Configure authentication redirect URLs for:
   - `http://localhost:5173`
   - Your Vercel production URL
   - Any Vercel preview URL you use
5. Never expose a Supabase service-role key in the frontend.

## Geoapify setup

1. Create a Geoapify project.
2. Enable Places API access.
3. Add the key as `VITE_GEOAPIFY_API_KEY`.
4. Restrict the key to your local and production origins where supported.
5. Confirm that the Places request quota covers your expected traffic.

## Groq, Tavily, and Google setup

### Groq

Create a Groq API key and configure:

```env
GROQ_API_KEY=...
GROQ_CHAT_MODEL=...
GROQ_STT_MODEL=...
```

The key is used only by the backend for chat, PDF analysis, and transcription.

### Tavily

Create a Tavily API key and configure:

```env
TAVILY_API_KEY=...
```

Without Tavily, the application can still run, but source-backed hospital
research metrics may be unavailable.

### Google Maps and Google Images

If exact Google Maps place photos are required:

1. Create or select a Google Cloud project.
2. Enable Places API and Places Photo API.
3. Create a server-side API key.
4. Restrict the key to the required APIs.
5. Add it as `GOOGLE_MAPS_API_KEY` on the backend only.

Google Custom Search image results additionally require:

```env
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

The application also provides a direct Google Images search link and public
image fallback when Google credentials are unavailable.

## CORS and production URLs

Before production deployment, update the backend CORS allowlist in
`src/server/server.js` to include the final Vercel origin. Include the exact
scheme and hostname, for example:

```text
https://builttechies.vercel.app
```

Do not use `*` for a production API that handles authentication, uploads, or
private user data.

## Post-deployment checklist

- [ ] Frontend opens on the Vercel URL.
- [ ] Browser console has no missing environment-variable errors.
- [ ] Supabase authentication redirect URLs include the Vercel domain.
- [ ] Hospital search returns Geoapify results.
- [ ] Maps load correctly.
- [ ] `/api/chat` responds from the production backend.
- [ ] Voice recording and `/api/transcribe` work over HTTPS.
- [ ] PDF upload and `/api/analyze-report` work within platform limits.
- [ ] Hospital verification returns a clear result.
- [ ] Comparison pages open after a refresh.
- [ ] Google Maps images work if the Places key is configured.
- [ ] API keys are restricted and are not present in client bundles.
- [ ] CORS accepts the production Vercel origin.

## Common deployment problems

### API requests still use localhost

Set `VITE_API_URL` in Vercel and redeploy. Vite variables are compiled into
the frontend at build time.

### CORS error in the browser

Add the exact Vercel origin to the backend CORS configuration and restart the
backend.

### Voice input works locally but not in production

Microphone access requires HTTPS and browser permission. Use the deployed
HTTPS URL, allow microphone access, and confirm that the backend has a valid
Groq key.

### Hospital verification returns an HTML response

The frontend is reaching the Vite/Vercel frontend instead of the API server.
Check `VITE_API_URL`, redeploy, and verify that the backend URL exposes the
`/api/hospital-research` route.

### Refreshing a React route returns 404

Configure Vercel SPA fallback rewrites if needed so routes such as `/chatbot`,
`/find-hospitals`, `/compare`, and `/team` serve `index.html`.

## License

This project is currently maintained as a hackathon project. Add the project's
final license terms before public redistribution.