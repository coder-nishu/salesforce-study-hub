import { Link } from 'react-router-dom'
import CourseSwitcher from './CourseSwitcher'
import { JUMP_SHORTCUT } from '../lib/platform'
import ThemeToggle from './ThemeToggle'

export default function Header({ onMenuClick, onJumpClick, menuOpen }) {
  return (
    <header className="header">
      <button
        type="button"
        className="header-menu"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        onClick={onMenuClick}
      >
        ☰
      </button>

      <Link to="/" className="header-brand" title="All courses">
        <span className="header-brand-icon" aria-hidden="true">⚡</span>
        <span className="header-brand-text">Salesforce Study Hub</span>
      </Link>

      <div className="header-switcher">
        <CourseSwitcher variant="header" />
      </div>

      <div className="header-actions">
        <button type="button" className="header-jump" onClick={onJumpClick} aria-label={`Jump to a page (${JUMP_SHORTCUT})`}>
          <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <line x1="12.8" y1="12.8" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="header-jump-label">Jump to…</span>
          <kbd className="header-jump-kbd">{JUMP_SHORTCUT}</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
