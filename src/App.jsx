import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

function FiltersNav({ className, activeFilter, onSelectFilter, onPick }) {
  return (
    <nav className={className} aria-label="Work categories">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`filter${activeFilter === f.id ? ' filterActive' : ''}`}
          onClick={() => {
            onSelectFilter(f.id)
            onPick?.()
          }}
          aria-pressed={activeFilter === f.id}
        >
          {f.label}
        </button>
      ))}
    </nav>
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

function lightboxMotionVarsFromRect(rect) {
  if (!rect || typeof window === 'undefined') {
    return { tx: 0, ty: 0, s0: 0.94 }
  }
  const iw = window.innerWidth
  const ih = window.innerHeight
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const tx = cx - iw / 2
  const ty = cy - ih / 2
  const s0 = Math.min(
    0.98,
    Math.max(0.14, Math.max(rect.width / (iw * 0.96), rect.height / (ih * 0.88))),
  )
  return { tx, ty, s0 }
}

export default function App() {
  const [filter, setFilter] = useState('all')
  const [activeItem, setActiveItem] = useState(null)
  const [lightboxFromRect, setLightboxFromRect] = useState(null)
  const [lightboxEntered, setLightboxEntered] = useState(false)
  const [navMenuOpen, setNavMenuOpen] = useState(false)

  const visibleItems = useMemo(() => {
    if (filter === 'all') return GRID_ITEMS
    return GRID_ITEMS.filter((item) => item.tags.includes(filter))
  }, [filter])

  const closeLightbox = useCallback(() => {
    setActiveItem(null)
    setLightboxFromRect(null)
    setLightboxEntered(false)
    setNavMenuOpen(false)
  }, [])

  const openLightboxFromCard = useCallback((item, cardButtonEl) => {
    setNavMenuOpen(false)
    const r = cardButtonEl?.getBoundingClientRect?.()
    setLightboxFromRect(r ?? null)
    setLightboxEntered(false)
    setActiveItem(item)
  }, [])

  useLayoutEffect(() => {
    if (!activeItem) return undefined
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const schedule = reduced
      ? () => requestAnimationFrame(() => setLightboxEntered(true))
      : () =>
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setLightboxEntered(true))
          })
    const id = schedule()
    return () => cancelAnimationFrame(id)
  }, [activeItem])

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

  useEffect(() => {
    if (!navMenuOpen || activeItem) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setNavMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navMenuOpen, activeItem])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const onChange = () => {
      if (mq.matches) setNavMenuOpen(false)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggleNavMenu = useCallback(() => {
    setNavMenuOpen((o) => !o)
  }, [])

  const lightboxMotionStyle = useMemo(() => {
    if (!activeItem) return undefined
    const m = lightboxMotionVarsFromRect(lightboxFromRect)
    return {
      '--lb-tx': `${m.tx}px`,
      '--lb-ty': `${m.ty}px`,
      '--lb-s0': String(m.s0),
    }
  }, [activeItem, lightboxFromRect])

  return (
    <>
      <div className={activeItem ? 'page page--behindLightbox' : 'page'}>
        <header className="topNav">
          <div className="logoMark">
            <img src={iviLogoSrc} alt="" className="logoImg" width={32} height={32} />
          </div>
          <FiltersNav
            className="filters filtersDesktop"
            activeFilter={filter}
            onSelectFilter={setFilter}
          />
          <div className="navMenuWrap">
            <button
              type="button"
              className="menuTrigger"
              aria-label={navMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navMenuOpen}
              aria-controls="nav-filter-menu"
              id="nav-menu-button"
              onClick={toggleNavMenu}
            >
              <MenuIcon />
            </button>
            <div
              id="nav-filter-menu"
              className="navMenuPanel"
              role="region"
              aria-labelledby="nav-menu-button"
              hidden={!navMenuOpen}
            >
              <FiltersNav
                className="filters filtersMenu"
                activeFilter={filter}
                onSelectFilter={setFilter}
                onPick={() => setNavMenuOpen(false)}
              />
            </div>
          </div>
        </header>
        {navMenuOpen && !activeItem ? (
          <button
            type="button"
            className="navMenuBackdrop"
            aria-label="Close menu"
            onClick={() => setNavMenuOpen(false)}
          />
        ) : null}

        <main className="masonry" aria-live="polite">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={item.columnSpanAll ? 'masonryItem masonryItem--spanAll' : 'masonryItem'}
            >
              <button
                type="button"
                className="card"
                onClick={(e) => openLightboxFromCard(item, e.currentTarget)}
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
          className={`lightbox${lightboxEntered ? ' lightbox--open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt}
          onClick={closeLightbox}
          style={lightboxMotionStyle}
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
