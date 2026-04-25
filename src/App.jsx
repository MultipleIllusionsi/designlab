import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { GRID_ITEMS } from './gridItems.js'
import iviLogoSrc from './assets/iviLogoSvgMono.svg?url'
import './App.css'

const WORK_DETAIL_PATH = '/w/:itemId'

const FILTERS = [
  { id: 'all', label: 'all' },
  { id: 'interface', label: 'interface' },
  { id: 'motion', label: 'motion' },
  { id: 'graphic', label: 'graphic' },
]

function WorkMedia({ item, className, detail }) {
  const { media, title, alt: altText } = item
  const src = detail ? media.fullSrc : media.previewSrc
  if (media.type === 'video') {
    return (
      <video
        key={detail ? `${item.id}-detail` : item.id}
        className={className}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload={detail ? 'auto' : 'metadata'}
        aria-label={title}
      />
    )
  }
  return <img className={className} src={src} alt={altText} />
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

function workDetailItemFromUrl(pathname) {
  const m = matchPath({ path: WORK_DETAIL_PATH, end: true, caseSensitive: true }, pathname)
  if (!m?.params?.itemId) return null
  return GRID_ITEMS.find((i) => i.id === m.params.itemId) ?? null
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [navMenuOpen, setNavMenuOpen] = useState(false)

  const detailItem = workDetailItemFromUrl(location.pathname)
  const openItemId = detailItem?.id

  const visibleItems = useMemo(() => {
    if (filter === 'all') return GRID_ITEMS
    return GRID_ITEMS.filter((item) => item.tags.includes(filter))
  }, [filter])

  const lightboxA11yIndex = useMemo(() => {
    if (!detailItem) return 0
    const i = visibleItems.findIndex((x) => x.id === detailItem.id)
    return i < 0 ? 0 : i
  }, [detailItem, visibleItems])

  const closeWorkDetail = useCallback(() => {
    setNavMenuOpen(false)
    navigate('/')
  }, [navigate])

  const goToAdjacent = useCallback(
    (delta) => {
      if (!detailItem) return
      const n = visibleItems.length
      if (n < 2) return
      const i = visibleItems.findIndex((x) => x.id === detailItem.id)
      if (i < 0) return
      const j = (i + delta + n) % n
      const newItem = visibleItems[j]
      if (newItem.id === detailItem.id) return
      navigate(`/w/${newItem.id}`)
    },
    [detailItem, visibleItems, navigate],
  )

  useEffect(() => {
    const m = matchPath({ path: WORK_DETAIL_PATH, end: true, caseSensitive: true }, location.pathname)
    if (m?.params?.itemId && !GRID_ITEMS.some((g) => g.id === m.params.itemId)) {
      queueMicrotask(() => navigate('/', { replace: true }))
    }
  }, [location.pathname, navigate])

  /** Detail route is valid for any work id in the catalog — do not close it when a filter hides that card. */
  useEffect(() => {
    if (!openItemId) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeWorkDetail()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToAdjacent(-1)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToAdjacent(1)
        return
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [openItemId, closeWorkDetail, goToAdjacent])

  useEffect(() => {
    if (!navMenuOpen || openItemId) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setNavMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navMenuOpen, openItemId])

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

  const pageClass = openItemId ? 'page page--lightbox' : 'page'
  const gridInBackground = openItemId != null

  return (
    <>
      <div className={pageClass}>
        <h1 className="siteBrand">ivi dsgn lab</h1>
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

        {navMenuOpen && !openItemId ? (
          <button
            type="button"
            className="navMenuBackdrop"
            aria-label="Close menu"
            onClick={() => setNavMenuOpen(false)}
          />
        ) : null}

        <main className={gridInBackground ? 'workGrid workGrid--lightbox' : 'workGrid'} aria-live="polite">
          {visibleItems.map((item) => (
            <div key={item.id} className="workGridItem">
              <Link
                to={`/w/${item.id}`}
                className="card"
                data-work-item-id={item.id}
                aria-label={`Open ${item.title}`}
              >
                <span className="cardInner">
                  <div className="cardMediaSlot">
                    <WorkMedia item={item} className="cardMedia" detail={false} />
                  </div>
                  <div className="cardText">
                    <h3 className="cardTitle">{item.title}</h3>
                  </div>
                </span>
              </Link>
            </div>
          ))}
        </main>

        {openItemId && detailItem && visibleItems.length > 1 ? (
          <>
            <div className="lightboxKeyHint lightboxKeyHint--prev" aria-hidden="true">
              <span className="lightboxKeyHint__label">Prev</span>
              <div className="lightboxKeyHint__row" role="presentation">
                <span className="lightboxKeyHint__key">←</span>
              </div>
            </div>
            <div className="lightboxKeyHint lightboxKeyHint--next" aria-hidden="true">
              <span className="lightboxKeyHint__label">Next</span>
              <div className="lightboxKeyHint__row" role="presentation">
                <span className="lightboxKeyHint__key">→</span>
              </div>
            </div>
            <button
              type="button"
              className="lightboxNavZone lightboxNavZone--prev"
              onClick={(e) => {
                e.stopPropagation()
                goToAdjacent(-1)
              }}
              tabIndex={-1}
              aria-label="Previous work"
            />
            <button
              type="button"
              className="lightboxNavZone lightboxNavZone--next"
              onClick={(e) => {
                e.stopPropagation()
                goToAdjacent(1)
              }}
              tabIndex={-1}
              aria-label="Next work"
            />
          </>
        ) : null}

        {detailItem && (
          <p id="work-detail-desc" className="lightboxDescription">
            {detailItem.description}
          </p>
        )}

        {detailItem && (
          <button
            type="button"
            className="lightboxClose"
            onClick={(e) => {
              e.stopPropagation()
              closeWorkDetail()
            }}
            aria-label="Close"
          >
            ×
          </button>
        )}

        {openItemId && detailItem && (
          <div
            className="workDetail"
            key={detailItem.id}
            role="dialog"
            aria-modal
            aria-label={`${detailItem.title} (${lightboxA11yIndex + 1} of ${visibleItems.length})`}
            aria-describedby="work-detail-desc"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="workDetail__inner" onClick={(e) => e.stopPropagation()}>
              <div className="workDetail__mediaSlot">
                <WorkMedia
                  key={`detail-media-${detailItem.id}`}
                  item={detailItem}
                  className="workDetail__media"
                  detail
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
