import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import CapacityMeter from '../../components/vm/CapacityMeter'
import { RecordLink } from '../../components/vm/FieldValue'
import LookupField from '../../components/vm/LookupField'
import MatchPanel, { MatchExplanation } from '../../components/vm/MatchPanel'
import RecordForm from '../../components/vm/RecordForm'
import RecordGraph from '../../components/vm/RecordGraph'
import SourceBadge from '../../components/vm/SourceBadge'
import { vmObjectPath, vmPath, vmRecordPath, vmScenariosPath } from '../../data/navigation'
import { getObject, labelFor } from '../../data/npc-vm'
import { HELP_LINKS } from '../../data/npc-vm/fields'
import { useCasesById } from '../../data/npc-vm/useCases'
import { assignmentValues, checkAssignment, shiftAssignments, shiftCapacity, shiftLabel } from '../../lib/vm/capacity'
import { findVolunteers, requirementsFor } from '../../lib/vm/matching'
import { displayName, getRecord, recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import NotFound from '../NotFound'

// Fill in what can be derived: a shift implies its job position, a job position its initiative.
function derive(records, ctx) {
  const next = { ...ctx }
  const shift = getRecord(records, next.shiftId)
  if (shift?.values.JobPositionId && !next.jobPositionId) next.jobPositionId = shift.values.JobPositionId
  if (shift && shift.values.JobPositionId !== next.jobPositionId) next.jobPositionId = shift.values.JobPositionId
  const job = getRecord(records, next.jobPositionId)
  if (job?.values.VolunteerInitiativeId && !next.initiativeId) next.initiativeId = job.values.VolunteerInitiativeId
  return next
}

function isStepDone(records, step, ctx) {
  if (['create', 'pick', 'assign'].includes(step.kind)) return Boolean(getRecord(records, ctx[step.saveAs]))
  if (step.kind === 'match') return Boolean(ctx[step.saveAs])
  return true
}

// ---------- Step views ----------

function CreateStep({ step, ctx, setCtx }) {
  const { records, create } = useVmStore()
  const object = getObject(step.objectApiName)
  const existing = getRecord(records, ctx[step.saveAs])
  const [mode, setMode] = useState('new')
  const filter = step.filter ? step.filter(ctx) : undefined
  const candidates = recordsOf(records, step.objectApiName).filter((r) => (filter ? filter(r) : true))

  if (existing) {
    return (
      <div className="vm-step-done">
        ✓ {object.label}: <RecordLink id={existing.id} /> <code>{existing.id}</code>
        <button type="button" className="vm-link-button" onClick={() => setCtx({ [step.saveAs]: undefined })}>
          Change
        </button>
      </div>
    )
  }
  return (
    <div>
      <div className="vm-radio-row">
        <label><input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} /> Create a new {object.label}</label>
        <label>
          <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} /> Use an existing one ({candidates.length})
        </label>
      </div>
      {mode === 'new' ? (
        <RecordForm
          key={JSON.stringify(step.prefill?.(ctx) ?? {})}
          objectApiName={step.objectApiName}
          initialValues={step.prefill?.(ctx) ?? {}}
          submitLabel={`Create ${object.label}`}
          onSubmit={(values) => {
            const result = create(step.objectApiName, values)
            if (result.ok) setCtx({ [step.saveAs]: result.id })
            return result
          }}
        />
      ) : (
        <LookupField targetObject={step.objectApiName} value="" filter={filter} onChange={(id) => setCtx({ [step.saveAs]: id })} />
      )}
    </div>
  )
}

function PickStep({ step, ctx, setCtx }) {
  const { records } = useVmStore()
  const filter = step.filter ? step.filter(ctx) : undefined
  const selected = getRecord(records, ctx[step.saveAs])
  return (
    <div>
      <LookupField targetObject={step.objectApiName} value={ctx[step.saveAs] ?? ''} filter={filter} onChange={(id) => setCtx({ [step.saveAs]: id || undefined })} />
      {selected?.learningNote && <p className="vm-learning-note">{selected.learningNote}</p>}
    </div>
  )
}

function AssignStep({ step, ctx, setCtx }) {
  const { records, create } = useVmStore()
  const [errors, setErrors] = useState([])
  const shift = getRecord(records, ctx.shiftId)
  const account = getRecord(records, ctx.accountId)
  const created = getRecord(records, ctx[step.saveAs])
  if (created) return <div className="vm-step-done">✓ Assignment <RecordLink id={created.id} /> created.</div>
  if (!account || !shift) return <p className="vm-empty">Choose a shift and select a volunteer in the previous steps first.</p>

  const values = assignmentValues(records, { accountId: account.id, shiftId: shift.id })
  return (
    <div>
      <dl className="vm-detail-grid">
        <div><dt>Assigned Account</dt><dd>{displayName(account)} <code>{account.id}</code></dd></div>
        <div><dt>Job Position</dt><dd>{displayName(getRecord(records, values.JobPositionId))} <code>{values.JobPositionId}</code></dd></div>
        <div><dt>Assigned Position Shift</dt><dd>{shiftLabel(records, shift)} <code>{shift.id}</code></dd></div>
        <div><dt>Related Volunteer Initiative</dt><dd>{displayName(getRecord(records, values.RelatedVolunteerInitiativeId)) || '—'}</dd></div>
        <div><dt>Count Toward Shift Capacity</dt><dd>Yes</dd></div>
      </dl>
      <p className="vm-form-hint">The assignment stores these as record IDs.</p>
      <button
        type="button"
        className="vm-button vm-button-primary"
        onClick={() => {
          const check = checkAssignment(records, shift.id, [account.id])
          if (!check.ok) return setErrors(check.errors)
          const result = create('JobPositionAssignment', values)
          if (result.ok) setCtx({ [step.saveAs]: result.id })
          else setErrors([...result.errors, ...Object.values(result.fieldErrors)])
        }}
      >
        Create Job Position Assignment
      </button>
      {errors.map((e) => <p key={e} className="vm-form-error">{e}</p>)}
    </div>
  )
}

function InspectStep({ ctx }) {
  const { records } = useVmStore()
  const shift = getRecord(records, ctx.shiftId)
  const account = getRecord(records, ctx.accountId)
  if (!shift || !account) return <p className="vm-empty">Choose a shift and a volunteer first.</p>
  const jobPositionId = shift.values.JobPositionId
  const requirementIds = requirementsFor(records, jobPositionId).map((r) => r.id)
  const { results } = findVolunteers(records, { jobPositionId, requirementIds, time: { shiftId: shift.id }, byLocation: true })
  const result = results.find((r) => r.account.id === account.id)
  return (
    <div className="vm-inspect">
      <p>
        <strong>{displayName(account)}</strong> for <strong>{shiftLabel(records, shift)}</strong>
      </p>
      <div className="vm-inspect-grid">
        {[['Qualification', result.qualification], ['Date/time', result.time], ['Location', result.location]].map(([label, dim]) => (
          <div key={label} className={`vm-inspect-dim ${dim.ok ? 'is-ok' : 'is-fail'}`}>
            <span>{label}</span>
            <strong>{dim.ok ? '✓' : '✗'}</strong>
          </div>
        ))}
        <div className={`vm-inspect-dim is-overall ${result.match ? 'is-ok' : 'is-fail'}`}>
          <span>Overall</span>
          <strong>{result.match ? 'MATCH' : 'Not a match for this shift'}</strong>
        </div>
      </div>
      <MatchExplanation result={result} />
    </div>
  )
}

function CoverageStep({ ctx }) {
  const { records } = useVmStore()
  const shift = getRecord(records, ctx.shiftId)
  if (!shift) return <p className="vm-empty">Choose a shift first.</p>
  const assignments = shiftAssignments(records, shift.id)
  return (
    <div>
      <p><strong>{shiftLabel(records, shift)}</strong></p>
      <CapacityMeter {...shiftCapacity(records, shift)} />
      {assignments.length > 0 && (
        <ul className="vm-link-list">
          {assignments.map((a) => (
            <li key={a.id}>
              <RecordLink id={a.id} /> — <RecordLink id={a.values.AssignedAccountId} /> ({a.values.Status})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RequirementsStep({ ctx }) {
  const { records } = useVmStore()
  const job = getRecord(records, ctx.jobPositionId)
  if (!job) return <p className="vm-empty">Choose a job position first.</p>
  const position = getRecord(records, job.values.PositionId)
  const reqs = requirementsFor(records, job.id)
  const row = (r) => (
    <li key={r.id}>
      <RecordLink id={r.id} /> — {r.target ? displayName(r.target) : '?'} {typeof r.level === 'number' && `QL ${r.level}`}
      {!r.evaluated && <em className="vm-not-evaluated"> (not evaluated: {r.notEvaluated})</em>}
    </li>
  )
  return (
    <div className="vm-compare">
      <div className="vm-compare-col">
        <span className="vm-compare-kicker">POSITION — general role</span>
        <strong>{position ? <RecordLink id={position.id} /> : 'No Position linked'}</strong>
        <span className="vm-compare-kicker">↓ Position Qualifications</span>
        <ul>{reqs.filter((r) => r.source === 'PQ').map(row)}</ul>
        <p className="vm-form-hint"><SourceBadge source="official" /> Apply across all related job positions.</p>
      </div>
      <div className="vm-compare-col">
        <span className="vm-compare-kicker">JOB POSITION — specific role</span>
        <strong><RecordLink id={job.id} /></strong>
        <span className="vm-compare-kicker">↓ Job Position Qualifications</span>
        <ul>{reqs.filter((r) => r.source === 'JPQ').map(row)}</ul>
        <p className="vm-form-hint"><SourceBadge source="official" /> Additive — apply only to this job position.</p>
      </div>
      <p className="vm-compare-result">
        Matching for this job considers <strong>both</strong> lists. <SourceBadge source="simplification" /> Here every
        selected requirement must be met, so the highest level for a competency effectively applies.{' '}
        <a href={HELP_LINKS.jobPositionQualifications} target="_blank" rel="noreferrer">Salesforce Help →</a>
      </p>
    </div>
  )
}

function InitiativeStep({ ctx }) {
  const { records } = useVmStore()
  const initiative = getRecord(records, ctx.initiativeId)
  if (!initiative) return <p className="vm-empty">Choose an initiative first.</p>
  const jobs = recordsOf(records, 'JobPosition').filter((j) => j.values.VolunteerInitiativeId === initiative.id)
  return (
    <div className="vm-initiative-jobs">
      {jobs.length === 0 && <p className="vm-empty">No job positions for this initiative yet.</p>}
      {jobs.map((job) => (
        <article key={job.id} className="vm-coverage-card">
          <header><RecordLink id={job.id} /></header>
          <p className="vm-form-hint">
            Position: {job.values.PositionId ? <RecordLink id={job.values.PositionId} /> : 'none'} · Location:{' '}
            {job.values.LocationId ? <RecordLink id={job.values.LocationId} /> : 'none'}
          </p>
          <strong className="vm-subhead">Requirements</strong>
          <ul>
            {requirementsFor(records, job.id).map((r) => (
              <li key={r.id}>{r.source} · {r.target ? displayName(r.target) : '?'} {typeof r.level === 'number' && `QL ${r.level}`}</li>
            ))}
            {requirementsFor(records, job.id).length === 0 && <li>None</li>}
          </ul>
          <strong className="vm-subhead">Shifts</strong>
          <ul>
            {recordsOf(records, 'JobPositionShift').filter((s) => s.values.JobPositionId === job.id).map((s) => {
              const c = shiftCapacity(records, s)
              return (
                <li key={s.id}>
                  <RecordLink id={s.id}>{`${s.values.StartDate ?? ''} ${s.values.StartTime ?? ''}–${s.values.EndTime ?? ''}`}</RecordLink> · {c.assigned}/{c.capacity ?? '∞'} assigned
                </li>
              )
            })}
          </ul>
        </article>
      ))}
    </div>
  )
}

function Step({ step, ctx, setCtx }) {
  const { records } = useVmStore()
  switch (step.kind) {
    case 'create':
      return <CreateStep step={step} ctx={ctx} setCtx={setCtx} />
    case 'pick':
      return <PickStep step={step} ctx={ctx} setCtx={setCtx} />
    case 'match':
      return ctx.jobPositionId || ctx.shiftId ? (
        <MatchPanel
          key={`${ctx.jobPositionId}-${ctx.shiftId}`}
          initialJobPositionId={ctx.jobPositionId}
          initialShiftId={ctx.shiftId}
          selectedAccountId={ctx[step.saveAs]}
          onSelect={(id) => setCtx({ [step.saveAs]: id })}
          onAssigned={(ids) => setCtx({ accountId: getRecord(records, ids[0])?.values.AssignedAccountId, assignmentId: ids[0] })}
        />
      ) : (
        <p className="vm-empty">Choose a job position or shift first.</p>
      )
    case 'assign':
      return <AssignStep step={step} ctx={ctx} setCtx={setCtx} />
    case 'inspect':
      return <InspectStep ctx={ctx} />
    case 'coverage':
      return <CoverageStep ctx={ctx} />
    case 'requirements':
      return <RequirementsStep ctx={ctx} />
    case 'initiative':
      return <InitiativeStep ctx={ctx} />
    case 'review': {
      const record = getRecord(records, ctx[step.recordKey])
      return record ? <RecordGraph record={record} depth={step.depth ?? 2} /> : <p className="vm-empty">Nothing to review yet.</p>
    }
    default:
      return null
  }
}

// ---------- Runner ----------

export default function VmUseCase() {
  const { useCaseId } = useParams()
  const { records } = useVmStore()
  const useCase = useCasesById.get(useCaseId)
  const [ctxState, setCtxState] = useState(() => {
    // Start from the scenario's demo defaults, when those records still exist.
    const defaults = useCasesById.get(useCaseId)?.defaults ?? {}
    return Object.fromEntries(Object.entries(defaults).filter(([, id]) => getRecord(records, id)))
  })
  const [index, setIndex] = useState(0)
  if (!useCase) return <NotFound />

  const ctx = derive(records, ctxState)
  const setCtx = (patch) => setCtxState((prev) => ({ ...derive(records, prev), ...patch }))
  const finished = index >= useCase.steps.length
  const step = useCase.steps[index]
  const canContinue = finished || step.optional || isStepDone(records, step, ctx)

  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'NPC Volunteer Management Lab', to: vmPath }, { label: 'Scenarios', to: vmScenariosPath }, { label: useCase.title }]} />
      <header className="page-header">
        <div className="page-eyebrow">Scenario {useCase.number}{useCase.label ? ` · ${useCase.label}` : ''}</div>
        <h1 className="page-title">{useCase.title}</h1>
        <p className="page-subtitle">“{useCase.description}”</p>
        <p className="vm-section-hint"><strong>You’ll learn:</strong> {useCase.learningObjective}</p>
      </header>

      <div className="vm-runner">
        <ol className="vm-runner-steps">
          {useCase.steps.map((s, i) => (
            <li key={i} className={`${i === index ? 'is-current' : ''}${i < index ? ' is-done' : ''}`}>
              <button type="button" onClick={() => setIndex(i)}>
                <span className="vm-runner-num">{i < index ? '✓' : i + 1}</span>
                {s.title}
                {s.optional && <em> (optional)</em>}
              </button>
            </li>
          ))}
          <li className={finished ? 'is-current' : ''}>
            <button type="button" onClick={() => setIndex(useCase.steps.length)}>
              <span className="vm-runner-num">★</span> What you just used
            </button>
          </li>
        </ol>

        <section className="vm-runner-panel" aria-live="polite">
          {!finished ? (
            <>
              <h2 className="vm-runner-title">Step {index + 1}. {step.title}</h2>
              {step.text && <p className="vm-section-hint">{step.text}</p>}
              <Step step={step} ctx={ctx} setCtx={setCtx} />
            </>
          ) : (
            <>
              <h2 className="vm-runner-title">What you just used</h2>
              <p>{useCase.resultExplanation}</p>
              <ul className="vm-used">
                {useCase.whatYouUsed.map((o) => (
                  <li key={o}><Link to={vmObjectPath(o)}>{labelFor(o)}</Link></li>
                ))}
              </ul>
              <h3 className="vm-subhead">Records in this scenario</h3>
              <ul className="vm-link-list">
                {Object.entries(ctx).filter(([, id]) => getRecord(records, id)).map(([key, id]) => (
                  <li key={key}>
                    <Link to={vmRecordPath(getRecord(records, id).objectApiName, id)}>{displayName(getRecord(records, id))}</Link>{' '}
                    <span className="vm-record-meta">{labelFor(getRecord(records, id).objectApiName)} · {id}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="vm-form-actions vm-runner-nav">
            <button type="button" className="vm-button" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              ← Back
            </button>
            {!finished && (
              <button type="button" className="vm-button vm-button-primary" disabled={!canContinue} onClick={() => setIndex(index + 1)}>
                {step.optional && !isStepDone(records, step, ctx) ? 'Skip →' : 'Next →'}
              </button>
            )}
            {!canContinue && <span className="vm-form-hint">Complete this step to continue.</span>}
          </div>
        </section>
      </div>
    </div>
  )
}
