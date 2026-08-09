// Single source of truth for ImageKit delivery URLs on the frontend.
// We store only the file name in the CMS; every transform lives here, so tuning a
// size is one edit. Keep the endpoint/folder in sync with studio/lib/imagekit.js.
//
// Endpoint: https://ik.imagekit.io/ivitest/ivi_design_lab/<filePath>

export const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/ivitest'
export const IMAGEKIT_FOLDER = 'ivi_design_lab'

/** Query-param transform syntax (folder-agnostic). */
export function imagekitUrl(filePath, transform) {
  const base = `${IMAGEKIT_URL_ENDPOINT}/${IMAGEKIT_FOLDER}/${filePath}`
  return transform ? `${base}?tr=${transform}` : base
}

// --- Transform presets -------------------------------------------------------
// Images: format is auto-optimized by ImageKit; c-at_max fits within the box
// without upscaling (Cloudinary c_limit equivalent).
const IMG_GRID = 'w-900,c-at_max'
const IMG_DETAIL = 'w-2400,c-at_max'

// Video strategy "Вариант 1": grid shows a short, small, looped preview clip
// (cheap on ImageKit video units); the detail view plays the untouched original
// (orig-true = 0 video units). See the CDN memory note for the reasoning.
const VIDEO_GRID_PREVIEW = 'w-640,du-3' // first 3s, 640px wide
const VIDEO_ORIGINAL = 'orig-true'

/** Grid (card) source. */
export function gridSrc(filePath, type) {
  return type === 'video'
    ? imagekitUrl(filePath, VIDEO_GRID_PREVIEW)
    : imagekitUrl(filePath, IMG_GRID)
}

/** Detail (lightbox) source. */
export function detailSrc(filePath, type) {
  return type === 'video'
    ? imagekitUrl(filePath, VIDEO_ORIGINAL)
    : imagekitUrl(filePath, IMG_DETAIL)
}

/**
 * Fallback for a grid video whose preview transform isn't available yet
 * (e.g. monthly video-unit quota spent, or first-transform still processing).
 * Serves the untouched original — heavier, but always works and needs no code
 * change when the quota resets and the light preview starts succeeding.
 */
export function gridVideoFallbackSrc(filePath) {
  return imagekitUrl(filePath, VIDEO_ORIGINAL)
}
