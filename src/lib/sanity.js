// Runtime data layer. Catalog + media both live in Sanity now (no ImageKit):
// images are transformed on delivery via Sanity CDN query params; videos and
// their grid previews are served as-is from the Sanity asset CDN.

const PROJECT_ID = 'vnxnf8kf'
const DATASET = 'production'
const API_VERSION = 'v2024-10-01'

// Read-only Viewer token (this project's dataset needs a token even though it's
// "public"). Vite inlines VITE_* at build time.
const READ_TOKEN = import.meta.env.VITE_SANITY_READ_TOKEN

if (!READ_TOKEN && import.meta.env.DEV) {
  console.warn('[sanity] VITE_SANITY_READ_TOKEN is not set — the catalog will come back empty.')
}

/** Sanity image URL with on-delivery transform (auto webp/avif, no upscale). */
function imageUrl(baseUrl, width) {
  return baseUrl ? `${baseUrl}?w=${width}&auto=format&fit=max&q=75` : null
}

const IMG_GRID = 900
const IMG_DETAIL = 2400

const QUERY = `*[_type=="mediaItem" && !(_id in path("drafts.**")) && (defined(image.asset) || defined(video.asset))]|order(orderRank asc){
  _id, title, description, alt, tags,
  "image": image.asset->{url, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
  "video": video.asset->url,
  "videoPreview": videoPreview.asset->url
}`

/** Map a Sanity doc to the shape the grid/detail components consume. */
function mapDoc(doc) {
  const base = {
    id: doc._id,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    alt: doc.alt || '',
    title: doc.title || '',
    description: doc.description || '',
  }

  if (doc.image?.url) {
    const { url, w, h } = doc.image
    return {
      ...base,
      intrinsic: w && h ? { width: w, height: h } : null,
      media: {
        type: 'image',
        previewSrc: imageUrl(url, IMG_GRID),
        fullSrc: imageUrl(url, IMG_DETAIL),
        previewFallbackSrc: null,
      },
    }
  }

  // Video: grid plays the light preview clip (falls back to the full file), the
  // detail view plays the full compressed file. Both served as-is (no transform).
  const full = doc.video
  return {
    ...base,
    intrinsic: null,
    media: {
      type: 'video',
      previewSrc: doc.videoPreview || full,
      fullSrc: full,
      previewFallbackSrc: full,
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
