// Generate + upload the 3-second grid preview for every ImageKit video that
// doesn't have one yet. Runs on GitHub Actions (or locally). Costs 0 ImageKit
// video units: sources are downloaded via orig-true (no transform), the preview
// is made locally with ffmpeg, and uploaded as a plain file.
//
// Requires: ffmpeg on PATH, env IMAGEKIT_PRIVATE_KEY.
// Run: IMAGEKIT_PRIVATE_KEY=xxx node scripts/sync-previews.mjs

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { IMAGEKIT_URL_ENDPOINT, IMAGEKIT_FOLDER } from '../src/lib/imagekit.js'

const execFileP = promisify(execFile)

const PREVIEW_SUBFOLDER = 'previews'
const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v', 'ogv'])
const UA = 'Mozilla/5.0 (compatible; sync-previews)'

const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY
if (!PRIVATE_KEY) {
  console.error('✖ IMAGEKIT_PRIVATE_KEY is not set')
  process.exit(1)
}
const AUTH = 'Basic ' + Buffer.from(PRIVATE_KEY + ':').toString('base64')

const isVideo = (name) => VIDEO_EXT.has((name.split('.').pop() || '').toLowerCase())

/** List file names directly in an ImageKit folder path (e.g. "/ivi_design_lab"). */
async function listFolder(path) {
  const url = `https://api.imagekit.io/v1/files?path=${encodeURIComponent(path)}&limit=1000`
  const res = await fetch(url, { headers: { Authorization: AUTH } })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`list ${path}: ${res.status} ${await res.text()}`)
  const items = await res.json()
  return items.filter((i) => i.type === 'file').map((i) => i.name)
}

async function makePreview(name, tmp) {
  // 1. download the original (orig-true = 0 video units)
  const srcUrl = `${IMAGEKIT_URL_ENDPOINT}/${IMAGEKIT_FOLDER}/${encodeURIComponent(name)}?tr=orig-true`
  const r = await fetch(srcUrl, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error(`download: ${r.status}`)
  const inPath = join(tmp, name)
  await writeFile(inPath, Buffer.from(await r.arrayBuffer()))

  // 2. ffmpeg -> first 3s, longest side 640, muted, web-optimized
  const outPath = join(tmp, `preview_${name}`)
  await execFileP('ffmpeg', [
    '-y', '-loglevel', 'error', '-t', '3', '-i', inPath, '-an',
    '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-vf', 'scale=w=640:h=640:force_original_aspect_ratio=decrease:force_divisible_by=2',
    outPath,
  ])

  // 3. upload to <folder>/previews/<name> with the exact same name
  const form = new FormData()
  form.append('file', new Blob([await readFile(outPath)]), name)
  form.append('fileName', name)
  form.append('folder', `/${IMAGEKIT_FOLDER}/${PREVIEW_SUBFOLDER}`)
  form.append('useUniqueFileName', 'false')
  form.append('overwriteFile', 'true')
  const up = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: AUTH },
    body: form,
  })
  if (!up.ok) throw new Error(`upload: ${up.status} ${await up.text()}`)
}

async function main() {
  const videos = (await listFolder(`/${IMAGEKIT_FOLDER}`)).filter(isVideo)
  const previews = new Set(await listFolder(`/${IMAGEKIT_FOLDER}/${PREVIEW_SUBFOLDER}`))
  const missing = videos.filter((v) => !previews.has(v))

  console.log(`videos: ${videos.length} · previews present: ${previews.size} · to generate: ${missing.length}`)
  if (missing.length === 0) {
    console.log('✓ all videos already have previews')
    return
  }

  const tmp = await mkdtemp(join(tmpdir(), 'sync-previews-'))
  let failed = 0
  try {
    for (const name of missing) {
      try {
        await makePreview(name, tmp)
        console.log(`  ✓ ${name}`)
      } catch (err) {
        failed += 1
        console.error(`  ✗ ${name}: ${err.message}`)
      }
    }
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }

  console.log(`done: ${missing.length - failed} generated, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
