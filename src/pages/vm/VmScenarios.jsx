import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { vmPath, vmProcessesPath, vmUseCasePath } from '../../data/navigation'
import { labelFor } from '../../data/npc-vm'
import { useCases } from '../../data/npc-vm/useCases'

export default function VmScenarios() {
  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'NPC Volunteer Management Lab', to: vmPath }, { label: 'Scenarios' }]} />
      <header className="page-header">
        <h1 className="page-title">Scenario Lab</h1>
        <p className="page-subtitle">
          Interactive scenarios that run against the records in the lab — you create, pick, match and assign real records,
          then see which objects you used. See also the <Link to={vmProcessesPath}>learning processes</Link>.
        </p>
      </header>
      <div className="vm-scenario-grid">
        {useCases.map((u) => (
          <Link key={u.id} to={vmUseCasePath(u.id)} className="vm-scenario-card">
            <span className="vm-scenario-num">{String(u.number).padStart(2, '0')}</span>
            <span className="vm-scenario-title">{u.title}</span>
            <span className="vm-scenario-desc">“{u.description}”</span>
            {u.label && <span className="vm-badge">{u.label}</span>}
            <span className="vm-scenario-objects">{u.whatYouUsed.slice(0, 5).map(labelFor).join(' · ')}</span>
            <span className="vm-scenario-steps">{u.steps.length} steps →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
