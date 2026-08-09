import { useCallback, useEffect, useRef, useState } from 'react'
import { set, unset } from 'sanity'
import { Badge, Card, Flex, Spinner, Stack, Text, TextInput } from '@sanity/ui'
import {
  IMAGEKIT_FOLDER,
  IMAGEKIT_URL_ENDPOINT,
  imagekitUrl,
  mediaTypeFromPath,
} from '../lib/imagekit'

/**
 * Custom input for the `imagekitAsset` object.
 *
 * The editor only types/pastes the ImageKit file name. On every change we probe
 * the delivered asset in the browser to auto-fill `type`, `width` and `height`
 * (so nobody enters dimensions by hand and masonry never shifts), and render a
 * live preview so a wrong path is obvious immediately.
 */
export function ImageKitInput(props) {
  const { value, onChange, readOnly } = props
  const filePath = (value?.filePath || '').trim()

  // idle | loading | ready | error
  const [status, setStatus] = useState('idle')
  const [probe, setProbe] = useState(null)

  // Keep onChange out of the probe effect deps so a new identity never re-triggers
  // a network probe; the effect only re-runs when filePath actually changes.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handlePathChange = useCallback(
    (event) => {
      const next = event.currentTarget.value.trim()
      onChangeRef.current(next ? set(next, ['filePath']) : unset(['filePath']))
    },
    [],
  )

  useEffect(() => {
    if (!filePath) {
      setStatus('idle')
      setProbe(null)
      return undefined
    }

    const url = imagekitUrl(filePath)
    const hintedType = mediaTypeFromPath(filePath)
    let cancelled = false
    let teardown = () => {}
    setStatus('loading')

    const persist = (result) => {
      if (cancelled) return
      if (result) {
        setProbe(result)
        setStatus('ready')
        onChangeRef.current([
          set(result.type, ['type']),
          set(result.width, ['width']),
          set(result.height, ['height']),
        ])
      } else {
        // Show the error state, but DO NOT unset saved type/width/height:
        // a transient probe failure (network/CORS/wrong endpoint) must never
        // wipe valid asset metadata on an existing document.
        setProbe(null)
        setStatus('error')
      }
    }

    const probeImage = () => {
      const img = new Image()
      const onLoad = () => persist({ type: 'image', width: img.naturalWidth, height: img.naturalHeight })
      const onErr = () => persist(null)
      img.addEventListener('load', onLoad)
      img.addEventListener('error', onErr)
      img.src = url
      teardown = () => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onErr)
        img.src = ''
      }
    }

    const probeVideo = () => {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.muted = true
      const onMeta = () => persist({ type: 'video', width: v.videoWidth, height: v.videoHeight })
      // If a videoish extension fails to load, fall back to an image probe.
      const onErr = () => (hintedType === null ? probeImage() : persist(null))
      v.addEventListener('loadedmetadata', onMeta)
      v.addEventListener('error', onErr)
      v.src = url
      teardown = () => {
        v.removeEventListener('loadedmetadata', onMeta)
        v.removeEventListener('error', onErr)
        v.src = ''
      }
    }

    // Unknown extension: try video first (covers the ambiguous case), image on failure.
    if (hintedType === 'image') probeImage()
    else probeVideo()

    return () => {
      cancelled = true
      teardown()
    }
  }, [filePath])

  return (
    <Stack space={3}>
      <TextInput
        value={filePath}
        onChange={handlePathChange}
        readOnly={readOnly}
        placeholder="e.g. 10_sharingplayer_video.mp4"
      />
      <Text size={1} muted>
        File name inside {IMAGEKIT_URL_ENDPOINT}/{IMAGEKIT_FOLDER}/ — no host, no folder.
      </Text>

      {status === 'loading' && (
        <Flex align="center" gap={2}>
          <Spinner muted />
          <Text size={1} muted>
            Checking file…
          </Text>
        </Flex>
      )}

      {status === 'error' && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>Not found at this path in ImageKit — check the file name.</Text>
        </Card>
      )}

      {status === 'ready' && probe && (
        <Stack space={3}>
          <Flex gap={2}>
            <Badge tone="primary">{probe.type === 'video' ? 'Video' : 'Image'}</Badge>
            <Badge mode="outline">
              {probe.width}×{probe.height}
            </Badge>
          </Flex>
          <Card radius={2} overflow="hidden" style={{ maxWidth: 320 }}>
            {probe.type === 'video' ? (
              <video
                src={imagekitUrl(filePath)}
                muted
                loop
                autoPlay
                playsInline
                style={{ width: '100%', display: 'block' }}
              />
            ) : (
              <img src={imagekitUrl(filePath)} alt="" style={{ width: '100%', display: 'block' }} />
            )}
          </Card>
        </Stack>
      )}
    </Stack>
  )
}
