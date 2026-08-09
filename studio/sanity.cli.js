import { defineCliConfig } from 'sanity/cli'

// projectId/dataset come from studio/.env (SANITY_STUDIO_* are auto-loaded by the CLI).
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
