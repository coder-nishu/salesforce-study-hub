import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { currentCatalogEntry } from '../data/navigation'
import { JUMP_SHORTCUT } from '../lib/platform'
import { saveLastVisit } from '../lib/theme'
import Header from './Header'
import JumpTo from './JumpTo'
import Sidebar from './Sidebar'

export default function Layout() {
  const { pathname, hash } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [jumpOpen, setJumpOpen] = useState(false)
  const jumpTrigger = useRef(null)

  // Close the mobile sidebar whenever the route changes.
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setSidebarOpen(false)
  }

  // On page change: jump to the #section if the URL has one, otherwise to the top.
  // Also remember the page for "Continue where you left off" on the home page.
  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
    const course = currentCatalogEntry(pathname)
    if (course) {
      const title = document.querySelector('main h1')?.textContent ?? course.title
      saveLastVisit({ path: pathname, title, course: course.title, kind: course.kind })
    }
    // Only on page changes; in-page #hash clicks are handled natively by the browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  // Ctrl/⌘ K or "/" opens Jump to (not while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault()
        jumpTrigger.current = document.activeElement
        setJumpOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openJump() {
    jumpTrigger.current = document.activeElement
    setJumpOpen(true)
  }

  function closeJump() {
    setJumpOpen(false)
    jumpTrigger.current?.focus?.()
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} onJumpClick={openJump} menuOpen={sidebarOpen} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} />
        {sidebarOpen && <div className="sidebar-backdrop" aria-hidden="true" onClick={() => setSidebarOpen(false)} />}
        <main className="main" id="main" tabIndex={-1}>
          <div className="main-inner">
            <Outlet />
          </div>
          <footer className="site-footer">
            <span>Salesforce Study Hub · offline learning — your lab data stays in this browser.</span>
            <span className="site-footer-links">
              <Link to="/">All courses</Link>
              <button type="button" className="vm-link-button" onClick={openJump}>
                Jump to ({JUMP_SHORTCUT})
              </button>
            </span>
          </footer>
        </main>
      </div>
      <JumpTo open={jumpOpen} onClose={closeJump} />
    </div>
  )
}
