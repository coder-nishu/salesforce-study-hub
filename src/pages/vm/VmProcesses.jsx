import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { vmObjectPath, vmPath, vmUseCasePath } from '../../data/navigation'
import { labelFor } from '../../data/npc-vm'
import { processes, supportingRoles } from '../../data/npc-vm/processes'

export default function VmProcesses() {
  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'NPC Volunteer Management Lab', to: vmPath }, { label: 'Processes' }]} />
      <header className="page-header">
        <h1 className="page-title">Learning processes</h1>
        <p className="page-subtitle">
          How groups of objects work together. These are learning views — not a single official Salesforce pipeline — and not
          every object takes part in a process.
        </p>
      </header>

      {processes.map((p) => (
        <section key={p.id} className="vm-section vm-process">
          <h2 className="vm-process-title">
            {p.title}
            {p.label && <span className="vm-badge">{p.label}</span>}
          </h2>
          <p className="vm-section-hint">{p.question}</p>
          <ol className="vm-process-steps">
            {p.steps.map((step, i) => (
              <Fragment key={step.objectApiName ?? step.label}>
                {i > 0 && <li className="vm-process-arrow" aria-hidden="true">↓</li>}
                <li className="vm-process-step">
                  {step.objectApiName ? (
                    <Link to={vmObjectPath(step.objectApiName)} className="vm-process-name">{labelFor(step.objectApiName)}</Link>
                  ) : (
                    <Link to={step.to} className="vm-process-name is-action">{step.label}</Link>
                  )}
                  <span className="vm-process-note">{step.note}</span>
                </li>
              </Fragment>
            ))}
          </ol>
          <Link to={vmUseCasePath(p.useCaseId)}>Try it as a scenario →</Link>
        </section>
      ))}

      <section className="vm-section">
        <h2 className="section-label">Objects with supporting roles</h2>
        <div className="vm-role-grid">
          {supportingRoles.map((r) => (
            <div key={r.role} className="vm-role">
              <strong>{r.role}</strong>
              <span>
                {r.objects.map((o, i) => (
                  <Fragment key={o}>
                    {i > 0 && ' · '}
                    <Link to={vmObjectPath(o)}>{labelFor(o)}</Link>
                  </Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
