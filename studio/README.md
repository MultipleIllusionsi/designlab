# ivi design lab — Sanity Studio

CMS catalog for the gallery. Holds the order + metadata of each card; the media
bytes live in ImageKit. The frontend (repo root) reads this via GROQ.

- **Asset model:** we store only the ImageKit file name in `asset.filePath` (no host,
  no folder). URLs are assembled in code, so changing a transform size is one edit.
- **Order:** drag-and-drop in the "Media items" list, backed by `orderRank`
  (`@sanity/orderable-document-list`).
- **Custom input:** paste a file name; type / width / height auto-fill and a preview renders.

## One-time setup (needs your Sanity login — run these yourself)

Everything below runs from this `studio/` folder.

```bash
cd studio
npm install
npx sanity login          # opens the browser; use the shared account
```

Create the project in the dashboard (safe — won't touch the config in this folder):

1. Open https://www.sanity.io/manage → **Create new project** (shared account).
2. Add a dataset named **production** (Public — the frontend needs read access).
3. Copy the **Project ID** from the project's settings.

Then copy the env file and paste that ID:

```bash
cp .env.example .env
# edit .env -> SANITY_STUDIO_PROJECT_ID=<your id>, SANITY_STUDIO_DATASET=production
```

Allow the site + local Studio to read the API (CORS):

```bash
npx sanity cors add http://localhost:5173 --no-credentials          # local Vite dev
npx sanity cors add http://localhost:3333 --no-credentials          # local Studio dev
npx sanity cors add https://ivi-design-lab.vercel.app --no-credentials
```

## Run / deploy

```bash
npm run dev          # local Studio at http://localhost:3333
npm run build        # production build
npm run deploy       # deploy to https://<hostname>.sanity.studio
```

## Notes

- `.env` is gitignored. `SANITY_WRITE_TOKEN` is only for the step-3 migration script —
  the Studio and frontend never need it.
- Shared account by design: no per-user history; rotate the password on offboarding.
