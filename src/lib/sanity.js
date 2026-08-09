// Runtime data layer: fetch the ordered catalog from Sanity's CDN endpoint.
// SPA/Vite -> plain fetch against apicdn (Sanity caches the response on their
// edge), so a new card appears a few seconds after publish without a redeploy.
// projectId/dataset are public values (they ship in every Sanity frontend).

import { detailSrc, gridSrc, gridVideoFallbackSrc } from './imagekit.js'

const PROJECT_ID = 'vnxnf8kf'
const DATASET = 'production'
const API_VERSION = 'v2024-10-01'

// Read-only Viewer token. This project's dataset is "public", but (per Sanity's
// newer access model) that no longer grants anonymous API reads, so the frontend
// authenticates with a read-only token. Vite inlines VITE_* at build time; the
// token can only read the already-public published catalog — no write, no drafts.
const READ_TOKEN = import.meta.env.VITE_SANITY_READ_TOKEN

if (!READ_TOKEN && import.meta.env.DEV) {
  console.warn('[sanity] VITE_SANITY_READ_TOKEN is not set — the catalog will come back empty.')
}

// Published docs only (drafts require auth and are excluded belt-and-suspenders),
// ordered by the drag-and-drop orderRank, with a usable asset.
const QUERY = `*[_type=="mediaItem" && !(_id in path("drafts.**")) && defined(asset.filePath)]|order(orderRank asc){
  _id, title, description, alt, tags,
  "filePath": asset.filePath, "type": asset.type,
  "width": asset.width, "height": asset.height
}`

/** Map a Sanity doc to the shape the grid/detail components consume. */
function mapDoc(doc) {
  const { _id, filePath, type } = doc
  const width = typeof doc.width === 'number' ? doc.width : null
  const height = typeof doc.height === 'number' ? doc.height : null
  return {
    id: _id,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    alt: doc.alt || '',
    title: doc.title || '',
    description: doc.description || '',
    // Known intrinsic size (images) lets masonry reserve space with no reflow;
    // null (videos) falls back to runtime detection.
    intrinsic: width && height ? { width, height } : null,
    media: {
      type,
      previewSrc: gridSrc(filePath, type),
      fullSrc: detailSrc(filePath, type),
      previewFallbackSrc: type === 'video' ? gridVideoFallbackSrc(filePath) : null,
    },
  }
}

export async function fetchMediaItems({ signal } = {}) {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`
  const headers = READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : undefined
  const res = await fetch(url, { signal, headers })
  if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`)
  const { result } = await res.json()
  return (Array.isArray(result) ? result : []).map(mapDoc)
}
