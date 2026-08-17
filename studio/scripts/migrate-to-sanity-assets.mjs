// One-off: move media from ImageKit into Sanity as native assets.
// Uploads local design_lab_assets/{compressed,previews} into Sanity and patches
// the existing mediaItem docs (adds image / video / videoPreview). Additive:
// the old `asset` field is left untouched, so nothing breaks and rollback is easy.
//
//   cd studio && node --env-file=.env scripts/migrate-to-sanity-assets.mjs

import { createClient } from '@sanity/client'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const COMPRESSED = join(HERE, '../../design_lab_assets/compressed')
const PREVIEWS = join(HERE, '../../design_lab_assets/previews')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN
if (!projectId || !token) {
  console.error('✖ Need SANITY_STUDIO_PROJECT_ID and SANITY_WRITE_TOKEN (studio/.env)')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-10-01', useCdn: false })

const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v', 'ogv'])
const isVideo = (n) => VIDEO_EXT.has((n.split('.').pop() || '').toLowerCase())
const ref = (type, id) => ({ _type: type, asset: { _type: 'reference', _ref: id } })

async function upload(kind, path, filename) {
  const asset = await client.assets.upload(kind, await readFile(path), { filename })
  return asset._id
}

async function main() {
  const docs = await client.fetch(
    `*[_type=="mediaItem"]{_id, "fp": asset.filePath, "hasImage": defined(image.asset), "hasVideo": defined(video.asset)}`,
  )
  console.log(`documents: ${docs.length}\n`)
  let migrated = 0, skipped = 0, failed = 0

  for (const d of docs) {
    if (d.hasImage || d.hasVideo) { skipped++; continue }
    if (!d.fp) { console.warn(`  ? ${d._id}: no asset.filePath — skip`); skipped++; continue }
    const local = join(COMPRESSED, d.fp)
    if (!existsSync(local)) { console.error(`  ✗ ${d._id}: missing local file ${d.fp}`); failed++; continue }

    try {
      if (isVideo(d.fp)) {
        const fields = { video: ref('file', await upload('file', local, d.fp)) }
        const prev = join(PREVIEWS, d.fp)
        if (existsSync(prev)) fields.videoPreview = ref('file', await upload('file', prev, d.fp))
        else console.warn(`    (no preview for ${d.fp})`)
        await client.patch(d._id).set(fields).commit()
      } else {
        await client.patch(d._id).set({ image: ref('image', await upload('image', local, d.fp)) }).commit()
      }
      console.log(`  ✓ ${d._id}  ${d.fp}`)
      migrated++
    } catch (err) {
      console.error(`  ✗ ${d._id} ${d.fp}: ${err.message}`)
      failed++
    }
  }

  console.log(`\ndone: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  if (failed) process.exit(1)
}

main().catch((err) => { console.error(err); process.exit(1) })
