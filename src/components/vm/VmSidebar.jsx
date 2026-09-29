import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  vmModelPath,
  vmObjectPath,
  vmObjectsPath,
  vmPath,
  vmProcessesPath,
  vmScenariosPath,
} from '../../data/navigation'
import { areas, getObject, objectsByArea } from '../../data/npc-vm'

const LEARN = [
  { to: vmPath, label: 'Lab home', end: true },
  { to: vmScenariosPath, label: 'Scenario Lab', match: '/vm/use-cases' },
  { to: vmProcessesPath, label: 'Processes' },
  { to: vmModelPath(), label: 'Data Model' },
  { to: vmObjectsPath, label: 'Object Explorer', end: true },
]


const linkClass = (base) => ({ isActive }) => `${base}${isActive ? ' is-current' : ''}`

export default function VmSidebar() {
  const { pathname } = useLocation()
  const activeApiName = pathname.startsWith(`${vmObjectsPath}/`)
    ? decodeURIComponent(pathname.slice(vmObjectsPath.length + 1).split('/')[0])
    : null
  const activeArea = getObject(activeApiName)?.area ?? null

  // Open/closed state per area, in memory for this session only.
  const [openAreas, setOpenAreas] = useState(() => (activeArea ? { [activeArea]: true } : {}))
  const [prevActiveArea, setPrevActiveArea] = useState(activeArea)
  if (activeArea !== prevActiveArea) {
    setPrevActiveArea(activeArea)
    if (activeArea) setOpenAreas((prev) => ({ ...prev, [activeArea]: true }))
  }
  const toggle = (id) => setOpenAreas((prev) => ({ ...prev, [id]: !prev[id] }))

  const isActive = (item) =>
    item.match ? pathname.startsWith(item.match) : item.end ? pathname === item.to : pathname.startsWith(item.to.split('?')[0])

  const group = (label, items) => (
    <>
      <div className="sidebar-section-label">{label}</div>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li key={item.label} className="sidebar-topic">
            <div className="sidebar-topic-row">
              <Link to={item.to} className={`sidebar-topic-link${isActive(item) ? ' is-current' : ''}`} aria-current={isActive(item) ? 'page' : undefined}>
                {item.label}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <>
      {group('Learn', LEARN)}

      <div className="sidebar-section-label vm-sidebar-areas">Objects by area</div>
      <ul className="sidebar-list">
        {areas.map((area) => {
          const isOpen = Boolean(openAreas[area.id])
          const listId = `vm-sidebar-${area.id}`
          return (
            <li key={area.id} className={`sidebar-topic${area.id === activeArea ? ' is-active' : ''}`}>
              <div className="sidebar-topic-row">
                <Link to={`${vmObjectsPath}?area=${area.id}`} className="sidebar-topic-link">
                  <span className={`vm-dot vm-area-${area.colorToken}`} aria-hidden="true" />
                  {area.label}
                </Link>
                <button
                  type="button"
                  className={`sidebar-toggle${isOpen ? ' is-open' : ''}`}
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${area.label}`}
                  onClick={() => toggle(area.id)}
                >
                  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {isOpen && (
                <ul id={listId} className="sidebar-subtopics">
                  {objectsByArea.get(area.id).map((obj) => (
                    <li key={obj.apiName}>
                      <NavLink to={vmObjectPath(obj.apiName)} className={linkClass('sidebar-subtopic-link')}>
                        {obj.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
