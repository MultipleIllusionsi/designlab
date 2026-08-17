// Single source of truth for ImageKit delivery URLs on the frontend.
// We store only the file name in the CMS; every transform lives here, so tuning a
// size is one edit. Keep the endpoint/folder in sync with studio/lib/imagekit.js.
//
// Endpoint: https://ik.imagekit.io/ivi/ivi_design_lab/<filePath>  (shared team account, compressed assets)

export const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/ivi'
export const IMAGEKIT_FOLDER = 'ivi_design_lab'

/** Query-param transform syntax (folder-agnostic). */
export function imagekitUrl(filePath, transform) {
  const base = `${IMAGEKIT_URL_ENDPOINT}/${IMAGEKIT_FOLDER}/${filePath}`
  return transform ? `${base}?tr=${transform}` : base
}

const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v', 'ogv'])
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'])

/**
 * Media type from the file extension. Used as a safety fallback so a missing/bad
 * CMS `type` can never make us request an image transform on a video file (which
 * ImageKit processes as a full, expensive video transformation). Returns null if
 * the extension is unrecognized.
 */
export function mediaTypeFromPath(filePath) {
  const ext = (filePath.split('.').pop() || '').toLowerCase()
  if (VIDEO_EXT.has(ext)) return 'video'
  if (IMAGE_EXT.has(ext)) return 'image'
  return null
}

// --- Transform presets -------------------------------------------------------
// Images: format is auto-optimized by ImageKit; c-at_max fits within the box
// without upscaling (Cloudinary c_limit equivalent).
const IMG_GRID = 'w-900,c-at_max'
const IMG_DETAIL = 'w-2400,c-at_max'

// Video strategy: we do NOT use ImageKit video transforms — they are billed by
// the SOURCE duration (not the trimmed output), so generating grid previews for
// the whole library blows the free video-unit quota. Instead, short 3s grid
// previews are generated locally (ffmpeg, see ASSET_COMPRESSION.md) and uploaded
// to a `previews/` subfolder. Everything is served with orig-true (0 video units):
//   grid   = previews/<file>  (tiny local clip)
//   detail = <file>           (full compressed original)
const VIDEO_ORIGINAL = 'orig-true'

/** Path of the pre-generated grid preview clip for a video file. */
function previewPath(filePath) {
  return `previews/${filePath}`
}

/** Grid (card) source. */
export function gridSrc(filePath, type) {
  return type === 'video'
    ? imagekitUrl(previewPath(filePath), VIDEO_ORIGINAL)
    : imagekitUrl(filePath, IMG_GRID)
}

/** Detail (lightbox) source. */
export function detailSrc(filePath, type) {
  return type === 'video'
    ? imagekitUrl(filePath, VIDEO_ORIGINAL)
    : imagekitUrl(filePath, IMG_DETAIL)
}

/**
 * Fallback for a grid video whose preview clip is missing (e.g. the `previews/`
 * file wasn't uploaded yet). Serves the full original — heavier, but still
 * orig-true (0 video units) and always works.
 */
export function gridVideoFallbackSrc(filePath) {
  return imagekitUrl(filePath, VIDEO_ORIGINAL)
}
