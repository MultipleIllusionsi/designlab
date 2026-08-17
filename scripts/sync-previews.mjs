// Generate + attach the 3-second grid preview for every Sanity video that
// doesn't have one yet. Runs on GitHub Actions (or locally). No dependencies —
// uses the Sanity HTTP API + ffmpeg. Costs nothing special: the source video is
// a public asset URL, the preview is made locally and uploaded as a file asset.
//
// Requires: ffmpeg on PATH, env SANITY_WRITE_TOKEN.
// Run: SANITY_WRITE_TOKEN=xxx node scripts/sync-previews.mjs

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileP = promisify(execFile)

const PROJECT_ID = 'vnxnf8kf'
const DATASET = 'production'
const API = `https://${PROJECT_ID}.api.sanity.io/v2024-10-01`

const TOKEN = process.env.SANITY_WRITE_TOKEN
if (!TOKEN) {
  console.error('✖ SANITY_WRITE_TOKEN is not set')
  process.exit(1)
}
const AUTH = { Authorization: `Bearer ${TOKEN}` }

async function query(groq) {
  const res = await fetch(`${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`, { headers: AUTH })
  if (!res.ok) throw new Error(`query: ${res.status} ${await res.text()}`)
  return (await res.json()).result
}

async function uploadFileAsset(buffer, filename) {
  const res = await fetch(`${API}/assets/files/${DATASET}?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'video/mp4' },
    body: buffer,
  })
  if (!res.ok) throw new Error(`upload: ${res.status} ${await res.text()}`)
  return (await res.json()).document._id
}

async function setPreview(docId, assetId) {
  const res = await fetch(`${API}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mutations: [
        { patch: { id: docId, set: { videoPreview: { _type: 'file', asset: { _type: 'reference', _ref: assetId } } } } },
      ],
    }),
  })
  if (!res.ok) throw new Error(`patch: ${res.status} ${await res.text()}`)
}

async function makePreview(videoUrl, tmp, base) {
  const r = await fetch(videoUrl)
  if (!r.ok) throw new Error(`download: ${r.status}`)
  const inPath = join(tmp, `${base}.src.mp4`)
  await writeFile(inPath, Buffer.from(await r.arrayBuffer()))

  const outPath = join(tmp, `${base}.preview.mp4`)
  await execFileP('ffmpeg', [
    '-y', '-loglevel', 'error', '-t', '3', '-i', inPath, '-an',
    '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-vf', 'scale=w=640:h=640:force_original_aspect_ratio=decrease:force_divisible_by=2',
    outPath,
  ])
  return readFile(outPath)
}

async function main() {
  // Published video docs that still lack a grid preview.
  const items = await query(
    `*[_type=="mediaItem" && !(_id in path("drafts.**")) && defined(video.asset) && !defined(videoPreview.asset)]{
      _id, "url": video.asset->url, "name": video.asset->originalFilename
    }`,
  )
  console.log(`videos without preview: ${items.length}`)
  if (items.length === 0) {
    console.log('✓ nothing to do')
    return
  }

  const tmp = await mkdtemp(join(tmpdir(), 'sync-previews-'))
  let failed = 0
  try {
    for (const [i, it] of items.entries()) {
      const name = it.name || `${it._id.replace(/[^a-z0-9]+/gi, '_')}.mp4`
      try {
        const buf = await makePreview(it.url, tmp, String(i))
        const assetId = await uploadFileAsset(buf, name)
        await setPreview(it._id, assetId)
        console.log(`  ✓ ${it._id}  ${name}`)
      } catch (err) {
        failed += 1
        console.error(`  ✗ ${it._id}: ${err.message}`)
      }
    }
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }

  console.log(`done: ${items.length - failed} generated, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
