// Shared ImageKit constants + URL helper for the Studio side (preview / probing only).
// The frontend gets its own copy of the builder in step 4; keep the two in sync.
//
// Endpoint the account gave us: https://ik.imagekit.io/ivi/ivi_design_lab
// We store only the file name in `filePath` (no host, no folder), e.g. "10_sharingplayer_video.mp4".

export const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/ivi'
export const IMAGEKIT_FOLDER = 'ivi_design_lab'

const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v', 'ogv'])
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'])

/**
 * Build a delivery URL. Uses the query-param transform syntax (`?tr=`), which is
 * folder-agnostic — the transform applies regardless of the endpoint folder.
 * @param {string} filePath  file name stored in the CMS
 * @param {string} [transform]  ImageKit transform string, e.g. "w-900,c-at_max"
 */
export function imagekitUrl(filePath, transform) {
  const base = `${IMAGEKIT_URL_ENDPOINT}/${IMAGEKIT_FOLDER}/${filePath}`
  return transform ? `${base}?tr=${transform}` : base
}

/** Guess media type from the file extension. Returns 'image' | 'video' | null. */
export function mediaTypeFromPath(filePath) {
  const ext = (filePath.split('.').pop() || '').toLowerCase()
  if (VIDEO_EXT.has(ext)) return 'video'
  if (IMAGE_EXT.has(ext)) return 'image'
  return null
}
