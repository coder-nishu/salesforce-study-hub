import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import CapacityMeter from '../../components/vm/CapacityMeter'
import { vmFindVolunteersPath, vmPath, vmRecordPath } from '../../data/navigation'
import { shiftLabel } from '../../lib/vm/capacity'
import { computeMetrics } from '../../lib/vm/metrics'
import { useVmStore } from '../../lib/vm/storeContext'

function Metrics({ items }) {
  return (
    <dl className="vm-stats vm-stats-wide">
      {items.map((m) => (
        <div key={m.label} title={m.definition}>
          <dt>{m.label}</dt>
          <dd>{m.value}</dd>
          <p className="vm-metric-def">{m.definition}</p>
        </div>
      ))}
    </dl>
  )
}

export default function VmDashboard() {
  const { records } = useVmStore()
  const metrics = computeMetrics(records)
  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'Volunteer Management Lab', to: vmPath }, { label: 'Dashboard' }]} />
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Every number is calculated from the records in the lab right now — each shows what it counts.</p>
      </header>

      <section className="vm-section">
        <h2 className="section-label">Data model</h2>
        <Metrics items={metrics.model} />
      </section>
      <section className="vm-section">
        <h2 className="section-label">Records</h2>
        <Metrics items={metrics.records} />
      </section>
      <section className="vm-section">
        <h2 className="section-label">Operations</h2>
        <Metrics items={metrics.operations} />
      </section>

      <section className="vm-section">
        <h2 className="section-label">Shift coverage</h2>
        {metrics.shifts.length === 0 && <p className="vm-empty">No upcoming or in-progress shifts.</p>}
        <div className="vm-coverage-list">
          {metrics.shifts.map((c) => (
            <article key={c.shift.id} className="vm-coverage-card">
              <header>
                <Link to={vmRecordPath('JobPositionShift', c.shift.id)}>{shiftLabel(records, c.shift)}</Link>
                <span className="vm-record-meta">{c.shift.values.Status ?? 'Upcoming'}</span>
              </header>
              <CapacityMeter {...c} />
              {(c.capacity === null || c.remaining > 0) && (
                <Link to={`${vmFindVolunteersPath}?shift=${c.shift.id}`}>Find volunteers →</Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
