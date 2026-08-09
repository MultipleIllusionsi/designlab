// One-off migration: hardcoded GRID_ITEMS (frontend) -> mediaItem documents in Sanity.
//
//   npm run migrate:dry     # build + print, DO NOT write (preview)
//   npm run migrate         # write to Sanity
//
// - Order is preserved by seeding `orderRank` exactly like @sanity/orderable-document-list
//   does (LexoRank.min() then .genNext().genNext() per item, in array order).
// - Files already live in ImageKit under the same names — we only move metadata.
// - Image dimensions are probed from the ImageKit URL. Video dimensions are left unset
//   (ImageKit gates non-browser requests to video); the frontend detects them at runtime.
// - Deterministic _id (`mediaItem.<id>`) + createOrReplace => safe to re-run (idempotent).
//   NOTE: re-running RESETS order to the original — run it before hand-reordering in Studio.

import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'
import probe from 'probe-image-size'
import { GRID_ITEMS } from '../../src/gridItems.js'
import { imagekitUrl } from '../lib/imagekit.js'

const DRY = process.argv.includes('--dry')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

function fail(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

if (!projectId) fail('SANITY_STUDIO_PROJECT_ID is missing (check studio/.env).')
if (!DRY && !token) {
  fail(
    'SANITY_WRITE_TOKEN is missing. Create an Editor (write) token at ' +
      'https://www.sanity.io/manage -> API -> Tokens, then add it to studio/.env.\n' +
      '  (Tip: run `npm run migrate:dry` first — it needs no token.)',
  )
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-10-01',
  useCdn: false,
})

/** Cloudinary URL -> bare file name (== ImageKit filePath), e.g. "1_terminal_video.mp4". */
function fileNameFromUrl(url) {
  return url.split('?')[0].split('/').pop()
}

/** Probe an image's intrinsic size over the ImageKit URL. Returns {width,height} or null. */
async function imageDimensions(filePath) {
  try {
    const { width, height } = await probe(imagekitUrl(filePath))
    if (width > 0 && height > 0) return { width, height }
  } catch (err) {
    console.warn(`  ! could not probe size for ${filePath}: ${err.message}`)
  }
  return null
}

async function buildDocs() {
  const docs = []
  let rank = LexoRank.min()

  for (const item of GRID_ITEMS) {
    rank = rank.genNext().genNext()
    const filePath = fileNameFromUrl(item.media.previewSrc)
    const type = item.media.type // 'image' | 'video'
    const dims = type === 'image' ? await imageDimensions(filePath) : null

    docs.push({
      _id: `mediaItem.${item.id}`,
      _type: 'mediaItem',
      orderRank: rank.toString(),
      title: item.title,
      description: item.description || '',
      alt: item.alt || '',
      tags: item.tags || [],
      asset: {
        _type: 'imagekitAsset',
        filePath,
        type,
        ...(dims ? { width: dims.width, height: dims.height } : {}),
      },
    })
  }
  return docs
}

async function main() {
  console.log(`\nMigration ${DRY ? '(dry run — nothing will be written)' : `-> ${projectId}/${dataset}`}\n`)

  const docs = await buildDocs()

  const withDims = docs.filter((d) => d.asset.width).length
  const videos = docs.filter((d) => d.asset.type === 'video').length
  console.log(`Built ${docs.length} documents (${videos} video, ${docs.length - videos} image).`)
  console.log(`Image dimensions resolved: ${withDims}/${docs.length - videos}. Video dimensions left to runtime.\n`)

  docs.forEach((d, i) => {
    const dims = d.asset.width ? `${d.asset.width}x${d.asset.height}` : 'runtime'
    console.log(
      `${String(i + 1).padStart(2)}. ${d.asset.type.padEnd(5)} ${d.asset.filePath.padEnd(34)} ${dims.padEnd(10)} — ${d.title}`,
    )
  })

  if (DRY) {
    console.log('\nDry run complete. Re-run without --dry to write.\n')
    return
  }

  const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction())
  await tx.commit()
  console.log(`\n✔ Committed ${docs.length} documents.`)

  // Verify: count + order straight from the dataset.
  const check = await client.fetch(
    '*[_type=="mediaItem"]|order(orderRank asc){"file":asset.filePath,title}',
  )
  console.log(`\nVerification — ${check.length} documents in Sanity, in orderRank order:`)
  check.forEach((d, i) => console.log(`${String(i + 1).padStart(2)}. ${d.file} — ${d.title}`))

  const ok = check.length === docs.length && check.every((d, i) => d.file === docs[i].asset.filePath)
  console.log(ok ? '\n✔ Count and order match the source.\n' : '\n✖ Mismatch — review the lists above.\n')
}

main().catch((err) => fail(err.stack || err.message))
