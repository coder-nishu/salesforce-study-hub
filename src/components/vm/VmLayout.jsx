import { Outlet } from 'react-router-dom'
import { useVmStore } from '../../lib/vm/storeContext'
import VmAppBar from './VmAppBar'
import VmStoreProvider from './VmStoreContext'

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

// Shell for every /vm route: the record store, the Salesforce-style app bar (records),
// and the page. Learning pages and objects by area live in the sidebar.
export default function VmLayout() {
  return (
    <VmStoreProvider>
      <div className="vm-shell">
        <VmAppBar />
        <LoadIssues />
        <Outlet />
      </div>
    </VmStoreProvider>
  )
}
