// Volunteer matching — a learning implementation of Salesforce's documented behaviour.
//
// Official (Salesforce Help, "Match Volunteers to Volunteer Initiative Job Positions and Shifts"):
// - Criteria: qualifications, shift or date-and-time range, and job position location.
//   Each can be switched off. If no criteria are selected, no volunteers appear.
// - Matching considers Position Qualifications (PQs) and Job Position Qualifications (JPQs).
// - Matching is inclusive: a Qualification Level (QL) equal to or greater than the required level matches.
// - Matching only uses competencies, not examinations, and evaluates QL — not Proficiency Level.
//   A Person Competency needs a QL set to appear as a match.
//
// Learning simplifications (labelled in the UI):
// - Date/time: a volunteer is available when one of their Person Location Availability records
//   has Operating Hours with a Time Slot on the shift's weekday covering its start–end time.
// - With both time and location on, one availability record must satisfy both.
// - Every selected requirement must be met, so the highest level for a competency wins.
// - Effective dates on Person Competency are not checked.

import { getRecord, recordsOf } from './records.js'
import { objectForId } from '../../data/npc-vm/index.js'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function weekdayOf(date) {
  const [y, m, d] = String(date).split('-').map(Number)
  if (!y || !m || !d) return null
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

// All PQs (via the job's Position) and JPQs for a job position.
export function requirementsFor(records, jobPositionId) {
  const job = getRecord(records, jobPositionId)
  if (!job) return []
  const toRequirement = (record, source) => {
    const targetId = record.values.QualificationReferenceRecordId
    const targetObject = objectForId(targetId)
    const level = record.values.QualificationLevel
    let notEvaluated = null
    if (targetObject === 'Examination') notEvaluated = 'Examination — matching only uses competencies.'
    else if (typeof level !== 'number') notEvaluated = 'No Qualification Level set.'
    return { id: record.id, source, record, targetId, targetObject, target: getRecord(records, targetId), level, evaluated: !notEvaluated, notEvaluated }
  }
  const pqs = job.values.PositionId
    ? recordsOf(records, 'PositionQualification').filter((q) => q.values.PositionId === job.values.PositionId).map((q) => toRequirement(q, 'PQ'))
    : []
  const jpqs = recordsOf(records, 'JobPositionQualification').filter((q) => q.values.JobPositionId === job.id).map((q) => toRequirement(q, 'JPQ'))
  return [...pqs, ...jpqs]
}

export function volunteers(records) {
  return recordsOf(records, 'Account').filter((a) => a.values.AccountType === 'Person Account')
}

// The time window to match: from a shift, or an explicit { date, startTime, endTime }.
export function timeWindow(records, time) {
  if (!time) return null
  if (time.shiftId) {
    const shift = getRecord(records, time.shiftId)
    if (!shift) return null
    return { date: shift.values.StartDate, day: weekdayOf(shift.values.StartDate), start: shift.values.StartTime, end: shift.values.EndTime, shift }
  }
  return { date: time.date, day: weekdayOf(time.date), start: time.startTime, end: time.endTime }
}

function coveringSlot(records, availability, window) {
  if (!availability.values.OperatingHoursId || !window?.day || !window.start || !window.end) return null
  return (
    recordsOf(records, 'TimeSlot').find(
      (slot) =>
        slot.values.OperatingHoursId === availability.values.OperatingHoursId &&
        slot.values.DayOfWeek === window.day &&
        slot.values.StartTime <= window.start &&
        slot.values.EndTime >= window.end,
    ) ?? null
  )
}

function describeWindow(window) {
  return `${window.day} ${window.start}–${window.end}`
}

/**
 * criteria: {
 *   jobPositionId,
 *   requirementIds: [PQ/JPQ ids to require]  (empty → don't match by qualification)
 *   time: { shiftId } | { date, startTime, endTime } | null
 *   byLocation: boolean
 * }
 */
export function findVolunteers(records, criteria) {
  const job = getRecord(records, criteria.jobPositionId)
  const requirements = requirementsFor(records, criteria.jobPositionId).filter((r) => criteria.requirementIds?.includes(r.id))
  const window = timeWindow(records, criteria.time)
  const locationId = criteria.byLocation ? job?.values.LocationId ?? null : null

  const active = {
    qualification: requirements.length > 0,
    time: Boolean(window),
    location: Boolean(criteria.byLocation),
  }
  if (!active.qualification && !active.time && !active.location) {
    return { noCriteria: true, results: [], requirements, window, job }
  }

  const results = volunteers(records).map((account) => {
    // --- Qualification ---
    const competencies = recordsOf(records, 'PersonCompetency').filter((pc) => pc.values.PersonId === account.id)
    const qualificationDetails = requirements.map((req) => {
      if (!req.evaluated) return { req, ok: true, skipped: true, reason: req.notEvaluated }
      const pc = competencies.find((c) => c.values.CompetencyId === req.targetId)
      if (!pc) return { req, ok: false, reason: `No ${req.target?.values.Name ?? 'competency'} competency.` }
      if (typeof pc.values.QualificationLevel !== 'number')
        return { req, pc, ok: false, reason: 'Has the competency, but no Qualification Level set.' }
      const ok = pc.values.QualificationLevel >= req.level
      return {
        req,
        pc,
        ok,
        reason: ok
          ? `QL ${pc.values.QualificationLevel} ≥ required ${req.level}`
          : `QL ${pc.values.QualificationLevel} < required ${req.level}`,
      }
    })

    // --- Availability and location ---
    const availabilities = recordsOf(records, 'PersonLocationAvailability').filter((p) => p.values.AccountId === account.id)
    const evaluated = availabilities.map((pla) => ({
      pla,
      slot: window ? coveringSlot(records, pla, window) : null,
      atLocation: locationId ? pla.values.LocationId === locationId : null,
    }))
    const timeOk = !active.time || evaluated.some((e) => e.slot)
    const locationOk = !active.location || evaluated.some((e) => e.atLocation)
    const combined = evaluated.find((e) => (!active.time || e.slot) && (!active.location || e.atLocation)) ?? null

    let availabilityReason = null
    if (active.time) {
      if (!availabilities.length) availabilityReason = 'No Person Location Availability records.'
      else if (!timeOk) availabilityReason = `No availability covering ${describeWindow(window)}.`
      else availabilityReason = `Available ${describeWindow(window)}.`
    }
    let locationReason = null
    if (active.location) {
      if (!locationId) locationReason = 'The job position has no location.'
      else if (!availabilities.length) locationReason = 'No Person Location Availability records.'
      else locationReason = locationOk ? 'Available at the job position’s location.' : 'Not available at the job position’s location.'
    }
    const sameRecordProblem = timeOk && locationOk && active.time && active.location && !combined
      ? 'Available at that time and at that location — but not in the same availability record.'
      : null

    const qualificationOk = qualificationDetails.every((d) => d.ok)
    const match = qualificationOk && timeOk && locationOk && (!(active.time && active.location) || Boolean(combined))
    const existingAssignments = recordsOf(records, 'JobPositionAssignment').filter(
      (a) => a.values.AssignedAccountId === account.id && (a.values.JobPositionId === job?.id || (window?.shift && a.values.AssignedPositionShiftId === window.shift.id)),
    )

    return {
      account,
      match,
      qualification: { active: active.qualification, ok: qualificationOk, details: qualificationDetails },
      time: { active: active.time, ok: timeOk && (!sameRecordProblem), reason: sameRecordProblem ?? availabilityReason, slot: combined?.slot ?? evaluated.find((e) => e.slot)?.slot ?? null },
      location: { active: active.location, ok: locationOk, reason: locationReason },
      availability: combined?.pla ?? null,
      existingAssignments,
    }
  })

  results.sort((a, b) => Number(b.match) - Number(a.match) || a.account.values.Name.localeCompare(b.account.values.Name))
  return { noCriteria: false, results, requirements, window, job, active }
}
