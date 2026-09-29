import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  vmDashboardPath,
  vmFindVolunteersPath,
  vmNewRecordPath,
  vmPath,
  vmRecordsPath,
} from '../../data/navigation'
import { areas, getObject, objectsByArea } from '../../data/npc-vm'

// Salesforce-style app navigation bar for the lab: object tabs, "More" for every other
// object, and "New" to create a record. Tabs are generated from the schema.

const RECORD_TABS = [
  { apiName: 'Account', label: 'Volunteers', filter: 'AccountType:Person Account' },
  { apiName: 'VolunteerInitiative', label: 'Initiatives' },
  { apiName: 'Position', label: 'Positions' },
  { apiName: 'JobPosition', label: 'Job Positions' },
  { apiName: 'JobPositionShift', label: 'Shifts' },
  { apiName: 'JobPositionAssignment', label: 'Assignments' },
]

const NEW_ITEMS = [
  { apiName: 'Account', label: 'Volunteer (Person Account)' },
  { apiName: 'PersonCompetency', label: 'Person Competency' },
  { apiName: 'PersonLocationAvailability', label: 'Person Location Availability' },
  { apiName: 'VolunteerInitiative', label: 'Volunteer Initiative' },
  { apiName: 'Position', label: 'Position' },
  { apiName: 'JobPosition', label: 'Job Position' },
  { apiName: 'JobPositionShift', label: 'Job Position Shift' },
  { apiName: 'JobPositionAssignment', label: 'Job Position Assignment' },
  { apiName: 'Competency', label: 'Competency' },
  { apiName: 'Location', label: 'Location' },
]

const TAB_OBJECTS = new Set(RECORD_TABS.map((t) => t.apiName))

// The object whose records this page shows (/vm/objects/:apiName/records…), if any.
function recordObjectFrom(pathname) {
  const match = /^\/vm\/objects\/([^/]+)\/records/.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

function Menu({ label, children, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()

  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`vm-appbar-menu ${className}`} ref={ref}>
      <button type="button" className="vm-appbar-tab vm-appbar-menu-button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}
        <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className={`vm-appbar-dropdown is-${align}`}>{children}</div>}
    </div>
  )
}

export default function VmAppBar() {
  const { pathname } = useLocation()
  const recordObject = recordObjectFrom(pathname)
  // Like Salesforce: an object without its own tab gets a temporary tab while you're in it.
  const tempTab = recordObject && !TAB_OBJECTS.has(recordObject) && getObject(recordObject) ? getObject(recordObject) : null

  const tabClass = (active) => `vm-appbar-tab${active ? ' is-active' : ''}`

  return (
    <nav className="vm-appbar" aria-label="Lab app navigation">
      <ul className="vm-appbar-tabs">
        <li className="vm-appbar-home"><Link to={vmPath} className={tabClass(pathname === vmPath)}>Home</Link></li>
        <li><Link to={vmDashboardPath} className={tabClass(pathname.startsWith(vmDashboardPath))}>Dashboard</Link></li>
        {RECORD_TABS.map((tab) => (
          <li key={tab.apiName}>
            <Link to={vmRecordsPath(tab.apiName, tab.filter)} className={tabClass(recordObject === tab.apiName)} aria-current={recordObject === tab.apiName ? 'page' : undefined}>
              {tab.label}
            </Link>
          </li>
        ))}
        <li><Link to={vmFindVolunteersPath} className={tabClass(pathname.startsWith(vmFindVolunteersPath))}>Find Volunteers</Link></li>
        {tempTab && (
          <li>
            <Link to={vmRecordsPath(tempTab.apiName)} className={`${tabClass(true)} is-temp`} aria-current="page">
              {tempTab.label}
            </Link>
          </li>
        )}
      </ul>
      <Menu label="More" align="right">
        <div className="vm-appbar-more">
          {areas.map((area) => (
            <div key={area.id} className="vm-appbar-more-group">
              <span className={`vm-appbar-more-title vm-area-${area.colorToken}`}>{area.label}</span>
              {objectsByArea.get(area.id).map((o) => (
                <Link key={o.apiName} to={vmRecordsPath(o.apiName)} className={recordObject === o.apiName ? 'is-current' : undefined}>
                  {o.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </Menu>
      <Menu label="+ New" align="right" className="vm-appbar-new">
        <div className="vm-appbar-new-list">
          {NEW_ITEMS.map((item) => (
            <Link key={item.apiName} to={vmNewRecordPath(item.apiName)}>
              {item.label}
            </Link>
          ))}
          <span className="vm-appbar-new-hint">Any other object: More → its list → New</span>
        </div>
      </Menu>
    </nav>
  )
}
