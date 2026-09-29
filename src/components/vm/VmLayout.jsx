import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  vmDashboardPath,
  vmFindVolunteersPath,
  vmModelPath,
  vmObjectsPath,
  vmPath,
  vmProcessesPath,
  vmRecordsPath,
  vmScenariosPath,
} from '../../data/navigation'
import { useVmStore } from '../../lib/vm/storeContext'
import VmStoreProvider from './VmStoreContext'

const TABS = [
  { to: vmPath, label: 'Home', end: true },
  { to: vmDashboardPath, label: 'Dashboard' },
  { to: vmObjectsPath, label: 'Objects', end: true },
  { to: vmRecordsPath('Account'), label: 'Volunteers', match: '/vm/objects/Account/' },
  { to: vmRecordsPath('VolunteerInitiative'), label: 'Initiatives', match: '/vm/objects/VolunteerInitiative/' },
  { to: vmRecordsPath('JobPosition'), label: 'Jobs', match: '/vm/objects/JobPosition/' },
  { to: vmRecordsPath('JobPositionShift'), label: 'Shifts', match: '/vm/objects/JobPositionShift/' },
  { to: vmRecordsPath('JobPositionAssignment'), label: 'Assignments', match: '/vm/objects/JobPositionAssignment/' },
  { to: vmFindVolunteersPath, label: 'Find Volunteers' },
  { to: vmModelPath(), label: 'Data Model' },
  { to: vmProcessesPath, label: 'Processes' },
  { to: vmScenariosPath, label: 'Scenarios', match: ['/vm/scenarios', '/vm/use-cases'] },
]

function LoadIssues() {
  const { loadIssues, dismissLoadIssues, resetDemo } = useVmStore()
  if (!loadIssues.length) return null
  return (
    <div className="vm-load-issues" role="alert">
      <strong>Your saved lab data couldn’t be loaded safely, so the demo data is shown instead.</strong>
      <ul>
        {loadIssues.slice(0, 5).map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
        {loadIssues.length > 5 && <li>…and {loadIssues.length - 5} more.</li>}
      </ul>
      <p>Nothing has been overwritten yet. Your next change will replace the saved data.</p>
      <div className="vm-form-actions">
        <button type="button" className="vm-button" onClick={resetDemo}>
          Use demo data
        </button>
        <button type="button" className="vm-button" onClick={dismissLoadIssues}>
          Dismiss
        </button>
      </div>
    </div>
  )
}

function Tabs() {
  const { pathname } = useLocation()
  return (
    <nav className="vm-tabs" aria-label="Volunteer Management Lab">
      <ul>
        {TABS.map((tab) => (
          <li key={tab.label}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => {
                const matches = [tab.match].flat().filter(Boolean)
                const active = isActive || matches.some((m) => pathname.startsWith(m))
                return `vm-tab${active ? ' is-active' : ''}`
              }}
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Shell for every /vm route: the record store, the lab's tab bar, and the page.
export default function VmLayout() {
  return (
    <VmStoreProvider>
      <div className="vm-shell">
        <Tabs />
        <LoadIssues />
        <Outlet />
      </div>
    </VmStoreProvider>
  )
}
