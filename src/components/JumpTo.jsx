import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchJumpIndex } from '../lib/jumpIndex'

const KIND_LABELS = {
  course: 'Course',
  lab: 'Lab',
  page: 'Page',
  topic: 'Domain',
  'lab-page': 'Lab page',
  scenario: 'Scenario',
  object: 'Object',
}

// "Jump to" — a quick navigator over every course, topic, page, scenario and object.
// Opens with the header button, Ctrl/⌘ K, or "/". Searches titles only.
export default function JumpTo({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listId = useId()

  // Start fresh every time it opens.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery('')
      setActive(0)
    }
  }

  const results = open ? searchJumpIndex(query) : []

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) return null

  function go(entry) {
    onClose()
    setQuery('')
    setActive(0)
    navigate(entry.path)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  // Group results by course, keeping ranking order.
  const groups = []
  results.forEach((entry, i) => {
    let group = groups.find((g) => g.name === entry.group)
    if (!group) {
      group = { name: entry.group, items: [] }
      groups.push(group)
    }
    group.items.push({ entry, i })
  })

  return (
    <div className="jump-backdrop" onMouseDown={onClose}>
      <div className="jump" role="dialog" aria-modal="true" aria-label="Jump to" onMouseDown={(e) => e.stopPropagation()}>
        <div className="jump-input-row">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <line x1="12.8" y1="12.8" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-label="Jump to a course, topic, page or object"
            placeholder="Jump to a course, topic, page or object…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>Esc</kbd>
        </div>
        <div id={listId} role="listbox" className="jump-results" aria-label="Results">
          {results.length === 0 && <p className="jump-empty">No page, topic or object matches “{query}”.</p>}
          {groups.map((group) => (
            <div key={group.name} role="group" aria-label={group.name}>
              <div className="jump-group">{group.name}</div>
              {group.items.map(({ entry, i }) => (
                <div
                  key={entry.path + entry.title}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`jump-item${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(entry)}
                >
                  <span className="jump-item-title">{entry.title}</span>
                  <span className="jump-item-sub">{entry.subtitle}</span>
                  <span className="jump-item-kind">{KIND_LABELS[entry.kind]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="jump-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>Enter</kbd> to open</span>
          <span>Searches page titles, topics and objects — not the text inside pages.</span>
        </div>
      </div>
    </div>
  )
}
