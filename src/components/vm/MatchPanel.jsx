import { useState } from 'react'
import { Link } from 'react-router-dom'
import { vmRecordPath } from '../../data/navigation'
import { HELP_LINKS } from '../../data/npc-vm/fields'
import { assignmentValues, checkAssignment, shiftCapacity, shiftLabel } from '../../lib/vm/capacity'
import { findVolunteers, requirementsFor } from '../../lib/vm/matching'
import { displayName, getRecord, recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import CapacityMeter from './CapacityMeter'
import { RecordLink } from './FieldValue'
import SourceBadge from './SourceBadge'

function Verdict({ dim, label }) {
  if (!dim.active) return <span className="vm-verdict is-off" title="Not used as a criterion">{label}: off</span>
  return (
    <span className={`vm-verdict ${dim.ok ? 'is-ok' : 'is-fail'}`}>
      {dim.ok ? '✓' : '✗'} {label}
    </span>
  )
}

export function MatchExplanation({ result }) {
  return (
    <ul className="vm-match-why">
      {result.qualification.active &&
        result.qualification.details.map((d) => (
          <li key={d.req.id} className={d.skipped ? 'is-skipped' : d.ok ? 'is-ok' : 'is-fail'}>
            {d.skipped ? '–' : d.ok ? '✓' : '✗'} <strong>{d.req.source}</strong> {d.req.target ? displayName(d.req.target) : '?'}
            {d.req.level !== undefined && ` (QL ${d.req.level})`}: {d.reason}
            {d.pc && (
              <>
                {' '}
                — <RecordLink id={d.pc.id} />
              </>
            )}
          </li>
        ))}
      {result.time.active && <li className={result.time.ok ? 'is-ok' : 'is-fail'}>{result.time.ok ? '✓' : '✗'} Date/time: {result.time.reason}</li>}
      {result.location.active && <li className={result.location.ok ? 'is-ok' : 'is-fail'}>{result.location.ok ? '✓' : '✗'} Location: {result.location.reason}</li>}
      {result.availability && (
        <li className="is-note">
          Using availability <RecordLink id={result.availability.id} />
        </li>
      )}
    </ul>
  )
}

// Find Volunteers — mirrors the official flow: initiative → job position → qualifications →
// shift / date-time range / none → location on/off → search.
export default function MatchPanel({ initialJobPositionId, initialShiftId, onSelect, selectedAccountId, onAssigned, allowAssign = true }) {
  const { records, create } = useVmStore()
  const initialShift = getRecord(records, initialShiftId)
  const initialJob = initialShift?.values.JobPositionId ?? initialJobPositionId ?? ''
  const [initiativeId, setInitiativeId] = useState(() => getRecord(records, initialJob)?.values.VolunteerInitiativeId ?? '')
  const [jobPositionId, setJobPositionId] = useState(initialJob)
  const [requirementIds, setRequirementIds] = useState(() => requirementsFor(records, initialJob).map((r) => r.id))
  const [timeMode, setTimeMode] = useState(initialShift ? 'shift' : 'none')
  const [shiftId, setShiftId] = useState(initialShift?.id ?? '')
  const [range, setRange] = useState({ date: '', startTime: '', endTime: '' })
  const [byLocation, setByLocation] = useState(true)
  const [ran, setRan] = useState(Boolean(initialShift))
  const [checked, setChecked] = useState([])
  const [messages, setMessages] = useState([])

  const initiatives = recordsOf(records, 'VolunteerInitiative')
  const jobs = recordsOf(records, 'JobPosition').filter((j) => !initiativeId || j.values.VolunteerInitiativeId === initiativeId)
  const shifts = recordsOf(records, 'JobPositionShift').filter((s) => s.values.JobPositionId === jobPositionId)
  const requirements = requirementsFor(records, jobPositionId)
  const shift = timeMode === 'shift' ? getRecord(records, shiftId) : null

  const criteria = {
    jobPositionId,
    requirementIds,
    time: timeMode === 'shift' && shiftId ? { shiftId } : timeMode === 'range' && range.date ? range : null,
    byLocation,
  }
  // Cheap to compute, so results simply follow the current criteria and records.
  const outcome = ran && jobPositionId ? findVolunteers(records, criteria) : null

  function chooseJob(id) {
    setJobPositionId(id)
    setRequirementIds(requirementsFor(records, id).map((r) => r.id))
    setShiftId('')
    setChecked([])
    setRan(false)
  }

  function assign() {
    const ids = checked
    const check = checkAssignment(records, shiftId, ids)
    if (shift && !check.ok) return setMessages(check.errors)
    const created = []
    const errors = []
    for (const accountId of ids) {
      const result = create('JobPositionAssignment', assignmentValues(records, { accountId, shiftId: shift?.id, jobPositionId }))
      if (result.ok) created.push(result.id)
      else errors.push(...result.errors, ...Object.values(result.fieldErrors))
    }
    setChecked([])
    setMessages(errors.length ? errors : [`Created ${created.length} assignment${created.length === 1 ? '' : 's'}.`])
    if (created.length) onAssigned?.(created)
  }

  const capacity = shift ? shiftCapacity(records, shift) : null

  return (
    <div className="vm-match">
      <div className="vm-match-criteria">
        <div className="vm-match-row">
          <label className="vm-select">
            <span>1. Volunteer initiative</span>
            <select value={initiativeId} onChange={(e) => { setInitiativeId(e.target.value); chooseJob('') }}>
              <option value="">All initiatives</option>
              {initiatives.map((i) => (
                <option key={i.id} value={i.id}>{displayName(i)}</option>
              ))}
            </select>
          </label>
          <label className="vm-select">
            <span>2. Job position</span>
            <select value={jobPositionId} onChange={(e) => chooseJob(e.target.value)}>
              <option value="">Choose a job position…</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{displayName(j)}</option>
              ))}
            </select>
          </label>
        </div>

        {jobPositionId && (
          <>
            <fieldset className="vm-match-group">
              <legend>3. Qualifications to require</legend>
              {requirements.length === 0 && <p className="vm-form-hint">This job position has no Position or Job Position Qualifications.</p>}
              {requirements.map((r) => (
                <label key={r.id} className={`vm-checkbox${r.evaluated ? '' : ' is-disabled'}`}>
                  <input
                    type="checkbox"
                    disabled={!r.evaluated}
                    checked={requirementIds.includes(r.id) && r.evaluated}
                    onChange={(e) => setRequirementIds((prev) => (e.target.checked ? [...prev, r.id] : prev.filter((x) => x !== r.id)))}
                  />
                  <span>
                    <strong>{r.source}</strong> {r.target ? displayName(r.target) : r.targetId}
                    {typeof r.level === 'number' && ` · QL ≥ ${r.level}`}
                    {!r.evaluated && <em className="vm-not-evaluated"> — not evaluated: {r.notEvaluated}</em>}
                  </span>
                </label>
              ))}
            </fieldset>

            <fieldset className="vm-match-group">
              <legend>4. Date and time</legend>
              <div className="vm-radio-row">
                {[
                  ['shift', 'By job position shift'],
                  ['range', 'By date-and-time range'],
                  ['none', 'Don’t match by date and time'],
                ].map(([mode, label]) => (
                  <label key={mode}>
                    <input type="radio" name="vm-time-mode" checked={timeMode === mode} onChange={() => setTimeMode(mode)} /> {label}
                  </label>
                ))}
              </div>
              {timeMode === 'shift' && (
                <select value={shiftId} onChange={(e) => { setShiftId(e.target.value); setChecked([]) }} aria-label="Shift">
                  <option value="">Choose a shift…</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>{shiftLabel(records, s)}</option>
                  ))}
                </select>
              )}
              {timeMode === 'range' && (
                <div className="vm-match-row">
                  <label className="vm-select"><span>Date</span><input type="date" value={range.date} onChange={(e) => setRange({ ...range, date: e.target.value })} /></label>
                  <label className="vm-select"><span>From</span><input type="time" value={range.startTime} onChange={(e) => setRange({ ...range, startTime: e.target.value })} /></label>
                  <label className="vm-select"><span>To</span><input type="time" value={range.endTime} onChange={(e) => setRange({ ...range, endTime: e.target.value })} /></label>
                </div>
              )}
            </fieldset>

            <fieldset className="vm-match-group">
              <legend>5. Location</legend>
              <div className="vm-radio-row">
                <label><input type="radio" name="vm-loc" checked={byLocation} onChange={() => setByLocation(true)} /> Search by job position location</label>
                <label><input type="radio" name="vm-loc" checked={!byLocation} onChange={() => setByLocation(false)} /> Don’t match by location</label>
              </div>
            </fieldset>

            <div className="vm-form-actions">
              <button type="button" className="vm-button vm-button-primary" onClick={() => setRan(true)}>
                Search Volunteers
              </button>
              {ran && <span className="vm-form-hint">Results update as you change criteria or records.</span>}
            </div>
          </>
        )}
      </div>

      {outcome?.noCriteria && (
        <p className="vm-empty">No matching criteria are selected, so no volunteers appear — this mirrors Salesforce.</p>
      )}

      {outcome && !outcome.noCriteria && (
        <div className="vm-match-results">
          {capacity && <CapacityMeter {...capacity} />}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {allowAssign && shift && <th className="vm-check-col"><span className="visually-hidden">Select</span></th>}
                  <th>Volunteer</th>
                  <th>Result</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {outcome.results.map((r) => {
                  const onShift = shift && r.existingAssignments.some((a) => a.values.AssignedPositionShiftId === shift.id && a.values.Status !== 'Canceled')
                  return (
                  <tr key={r.account.id} className={r.match ? 'is-match' : ''} aria-selected={selectedAccountId === r.account.id || undefined}>
                    {allowAssign && shift && (
                      <td className="vm-check-col">
                        <input
                          type="checkbox"
                          aria-label={`Select ${displayName(r.account)}`}
                          disabled={!r.match || onShift}
                          title={onShift ? 'Already assigned to this shift' : undefined}
                          checked={checked.includes(r.account.id)}
                          onChange={(e) => setChecked((prev) => (e.target.checked ? [...prev, r.account.id] : prev.filter((x) => x !== r.account.id)))}
                        />
                      </td>
                    )}
                    <td>
                      <Link to={vmRecordPath('Account', r.account.id)}>{displayName(r.account)}</Link>
                      {r.existingAssignments.length > 0 && (
                        <span className="vm-record-meta">
                          Already assigned: {r.existingAssignments.map((a) => <RecordLink key={a.id} id={a.id} />)}
                        </span>
                      )}
                      {onSelect && (
                        <button type="button" className="vm-link-button" onClick={() => onSelect(r.account.id)}>
                          {selectedAccountId === r.account.id ? '✓ Selected' : 'Select'}
                        </button>
                      )}
                    </td>
                    <td>
                      <strong className={r.match ? 'vm-result-match' : 'vm-result-nomatch'}>{r.match ? 'MATCH' : 'Not matched'}</strong>
                      <span className="vm-verdicts">
                        <Verdict dim={r.qualification} label="Qualification" />
                        <Verdict dim={r.time} label="Date/time" />
                        <Verdict dim={r.location} label="Location" />
                      </span>
                    </td>
                    <td>
                      <MatchExplanation result={r} />
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {allowAssign && shift && (
            <div className="vm-form-actions">
              <button type="button" className="vm-button vm-button-primary" disabled={!checked.length} onClick={assign}>
                Assign {checked.length || ''} selected to this shift
              </button>
              <span className="vm-form-hint">Only matched volunteers can be selected.</span>
            </div>
          )}
          {messages.map((m) => (
            <p key={m} className="vm-form-hint" role="status">{m}</p>
          ))}
        </div>
      )}

      <details className="vm-rules">
        <summary>How matching works here</summary>
        <ul>
          <li><SourceBadge source="official" /> “Matching is inclusive. A volunteer with a Qualification Level (QL) equal to or greater than the required level is a match.”</li>
          <li><SourceBadge source="official" /> Matching considers Position Qualifications and Job Position Qualifications, and only uses competencies — not examinations. Proficiency Level isn’t evaluated.</li>
          <li><SourceBadge source="official" /> If no matching criteria are selected, no volunteers appear.</li>
          <li><SourceBadge source="simplification" /> Date/time: a volunteer is available when a Person Location Availability’s Operating Hours has a Time Slot on the shift’s weekday covering its start and end time. With location on too, the same availability record must also be at the job’s location.</li>
          <li><SourceBadge source="simplification" /> Effective dates on Person Competency aren’t checked.</li>
        </ul>
        <p><a href={HELP_LINKS.match} target="_blank" rel="noreferrer">Salesforce Help: Match Volunteers →</a></p>
      </details>
    </div>
  )
}
