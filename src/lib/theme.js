// Theme and "continue where you left off" helpers. localStorage is optional:
// every access is wrapped, so the site still works when storage is blocked.

const THEME_KEY = 'sfsh.theme'
const LAST_VISIT_KEY = 'sfsh.lastVisit'

function read(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable — the choice lasts for this page view only
  }
}

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function hasSavedTheme() {
  const saved = read(THEME_KEY)
  return saved === 'light' || saved === 'dark'
}

export function applyTheme(theme, { save = true } = {}) {
  document.documentElement.setAttribute('data-theme', theme)
  if (save) write(THEME_KEY, theme)
}

export function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Follow system changes until the user picks a theme themselves.
export function watchSystemTheme(onChange) {
  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!query) return () => {}
  const handler = () => {
    if (!hasSavedTheme()) onChange(systemTheme())
  }
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}

// ---------- Last visited course page ----------

export function saveLastVisit(entry) {
  write(LAST_VISIT_KEY, JSON.stringify(entry))
}

export function lastVisit() {
  try {
    const value = JSON.parse(read(LAST_VISIT_KEY) ?? 'null')
    return value && typeof value.path === 'string' && typeof value.title === 'string' ? value : null
  } catch {
    return null
  }
}
