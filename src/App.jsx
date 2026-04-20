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

function GridVideo({ src, label, className, lightboxState }) {
  const ref = useRef(null)
  const fineHover = useFinePointerHover()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (lightboxState === 'dimmed') {
      el.pause()
      return
    }
    if (lightboxState === 'expanded') {
      void el.play().catch(() => {})
      return
    }
    if (fineHover) return
    void el.play().catch(() => {})
  }, [lightboxState, fineHover])

  const onEnter = useCallback(() => {
    if (!fineHover) return
    if (lightboxState === 'expanded') return
    void ref.current?.play()
  }, [fineHover, lightboxState])

  const onLeave = useCallback(() => {
    if (!fineHover) return
    if (lightboxState === 'expanded') return
    const el = ref.current
    if (!el) return
    el.pause()
    el.currentTime = 0
  }, [fineHover, lightboxState])

  return (
    <span className="gridVideoWrap" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <video
        ref={ref}
        className={className}
        src={src}
        muted
        playsInline
        loop
        autoPlay={!fineHover && lightboxState !== 'dimmed'}
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

function MediaView({ item, className, lightboxState, mediaRevealed, onRevealMedia }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (mediaRevealed) return
    const el = wrapRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => onRevealMedia(item.id))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onRevealMedia(item.id)
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [item.id, mediaRevealed, onRevealMedia])

  const { media } = item
  return (
    <span ref={wrapRef} className="mediaLazyRoot">
      {mediaRevealed ? (
        media.type === 'video' ? (
          <GridVideo
            className={className}
            src={media.src}
            label={item.alt}
            lightboxState={lightboxState}
          />
        ) : (
          <img className={className} src={media.src} alt={item.alt} />
        )
      ) : (
        <span className="mediaLazyPlaceholder" aria-hidden />
      )}
    </span>
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
  const [revealedMediaIds, setRevealedMediaIds] = useState(
    /** @returns {Set<string>} */ () => new Set(),
  )

  const visibleItems = useMemo(() => {
    if (filter === 'all') return GRID_ITEMS
    return GRID_ITEMS.filter((item) => item.tags.includes(filter))
  }, [filter])

  const revealMedia = useCallback((id) => {
    setRevealedMediaIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const closeLightbox = useCallback(() => {
    setActiveItem(null)
    setLightboxFromRect(null)
    setLightboxEntered(false)
    setNavMenuOpen(false)
  }, [])

  const openLightboxFromCard = useCallback((item, cardButtonEl) => {
    setNavMenuOpen(false)
    revealMedia(item.id)
    const r = cardButtonEl?.getBoundingClientRect?.()
    setLightboxFromRect(r ?? null)
    setLightboxEntered(false)
    setActiveItem(item)
  }, [revealMedia])

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

  useEffect(() => {
    if (!activeItem) return undefined
    if (!visibleItems.some((i) => i.id === activeItem.id)) {
      queueMicrotask(() => closeLightbox())
    }
  }, [activeItem, visibleItems, closeLightbox])

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
      <div className={activeItem ? 'page page--lightbox' : 'page'}>
        {activeItem ? (
          <div
            className={`lightbox lightboxShell${lightboxEntered ? ' lightbox--open' : ''}`}
            onClick={closeLightbox}
            aria-hidden
          />
        ) : null}
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

        <main
          className={activeItem ? 'masonry masonry--lightbox' : 'masonry'}
          aria-live="polite"
          {...(activeItem
            ? { role: 'dialog', 'aria-modal': true, 'aria-label': activeItem.alt }
            : {})}
        >
          {visibleItems.map((item) => {
            const isFlyout = activeItem?.id === item.id
            const lightboxState =
              activeItem == null ? 'none' : isFlyout ? 'expanded' : 'dimmed'
            const spanClass = item.columnSpanAll ? 'masonryItem masonryItem--spanAll' : 'masonryItem'
            const dimClass =
              activeItem && !isFlyout ? ' masonryItem--dimmed' : isFlyout ? ' masonryItem--flyoutSource' : ''

            return (
              <div key={item.id} className={`${spanClass}${dimClass}`}>
                {isFlyout && lightboxFromRect ? (
                  <div
                    className="cardFlyoutPlaceholder"
                    style={{ height: lightboxFromRect.height }}
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  className={`card${isFlyout ? ' card--flyoutOpen' : ''}${
                    isFlyout && lightboxEntered ? ' card--flyoutEntered' : ''
                  }`}
                  style={isFlyout ? lightboxMotionStyle : undefined}
                  onClick={(e) => {
                    if (isFlyout) {
                      e.stopPropagation()
                      return
                    }
                    openLightboxFromCard(item, e.currentTarget)
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isFlyout}
                >
                  <span className="cardInner" onClick={isFlyout ? (e) => e.stopPropagation() : undefined}>
                    <MediaView
                      item={item}
                      lightboxState={lightboxState}
                      mediaRevealed={revealedMediaIds.has(item.id)}
                      onRevealMedia={revealMedia}
                    />
                  </span>
                </button>
              </div>
            )
          })}
        </main>

        {activeItem ? (
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
        ) : null}
      </div>
    </>
  )
}
