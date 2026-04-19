import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GRID_ITEMS } from './gridItems.js'
import iviLogoSrc from './assets/iviLogoSvgMono.svg?url'
import './App.css'

const FILTERS = [
  { id: 'all', label: 'all' },
  { id: 'interface', label: 'interface' },
  { id: 'motion', label: 'motion' },
  { id: 'graphic', label: 'graphic' },
]

const FINE_POINTER_HOVER_MQ = '(hover: hover) and (pointer: fine)'

function useFinePointerHover() {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(FINE_POINTER_HOVER_MQ).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER_HOVER_MQ)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return matches
}

function GridVideo({ src, label, className, pauseForLightbox }) {
  const ref = useRef(null)
  const fineHover = useFinePointerHover()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (pauseForLightbox) {
      el.pause()
      return
    }
    if (fineHover) return
    void el.play().catch(() => {})
  }, [pauseForLightbox, fineHover])

  const onEnter = useCallback(() => {
    if (!fineHover) return
    void ref.current?.play()
  }, [fineHover])

  const onLeave = useCallback(() => {
    if (!fineHover) return
    const el = ref.current
    if (!el) return
    el.pause()
    el.currentTime = 0
  }, [fineHover])

  return (
    <span className="gridVideoWrap" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <video
        ref={ref}
        className={className}
        src={src}
        muted
        playsInline
        loop
        autoPlay={!fineHover && !pauseForLightbox}
        preload="metadata"
        aria-label={label}
      />
    </span>
  )
}

function MenuIcon() {
  return (
    <span className="menuIcon" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  )
}

function MediaView({ item, className, inLightbox, lightboxOpenForThisItem }) {
  const { media } = item
  if (media.type === 'video') {
    if (inLightbox) {
      return (
        <video
          className={className}
          src={media.src}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          aria-label={item.alt}
        />
      )
    }
    return (
      <GridVideo
        className={className}
        src={media.src}
        label={item.alt}
        pauseForLightbox={lightboxOpenForThisItem}
      />
    )
  }
  return (
    <img
      className={className}
      src={media.src}
      alt={item.alt}
      loading={inLightbox ? 'eager' : 'lazy'}
      fetchPriority={inLightbox ? 'high' : undefined}
    />
  )
}

export default function App() {
  const [filter, setFilter] = useState('all')
  const [activeItem, setActiveItem] = useState(null)

  const visibleItems = useMemo(() => {
    if (filter === 'all') return GRID_ITEMS
    return GRID_ITEMS.filter((item) => item.tags.includes(filter))
  }, [filter])

  const closeLightbox = useCallback(() => setActiveItem(null), [])

  useEffect(() => {
    if (!activeItem) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [activeItem, closeLightbox])

  return (
    <>
      <div className={activeItem ? 'page page--behindLightbox' : 'page'}>
        <header className="topNav">
          <div className="logoMark">
            <img src={iviLogoSrc} alt="" className="logoImg" width={32} height={32} />
          </div>
          <nav className="filters" aria-label="Work categories">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter${filter === f.id ? ' filterActive' : ''}`}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </nav>
          <button type="button" className="menuTrigger" aria-label="Menu">
            <MenuIcon />
          </button>
        </header>

        <main className="masonry" aria-live="polite">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={item.columnSpanAll ? 'masonryItem masonryItem--spanAll' : 'masonryItem'}
            >
              <button
                type="button"
                className="card"
                onClick={() => setActiveItem(item)}
                aria-haspopup="dialog"
              >
                <span className="cardInner">
                  <MediaView item={item} lightboxOpenForThisItem={activeItem?.id === item.id} />
                </span>
              </button>
            </div>
          ))}
        </main>
      </div>

      {activeItem ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt}
          onClick={closeLightbox}
        >
          <div className="lightboxPanel" onClick={(e) => e.stopPropagation()}>
            <MediaView item={activeItem} inLightbox />
          </div>
          <button
            type="button"
            className="lightboxClose"
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  )
}
