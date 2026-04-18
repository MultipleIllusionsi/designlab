import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import faviconUrl from './assets/iviLogoSvgMono.svg?url'
import './index.css'
import App from './App.jsx'

if (!document.querySelector('link[rel="icon"][data-app-favicon]')) {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = faviconUrl
  link.dataset.appFavicon = 'true'
  document.head.appendChild(link)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
