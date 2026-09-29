// Shift capacity — computed from Job Position Assignments, never stored.
//
// Official: a shift's Maximum Attendees caps assignments, and only assignments with
// "Count Toward Shift Capacity" checked use up capacity.
// Learning simplification: Canceled assignments never count.

import { getRecord, recordsOf } from './records.js'

export function shiftAssignments(records, shiftId) {
  return recordsOf(records, 'JobPositionAssignment').filter((a) => a.values.AssignedPositionShiftId === shiftId)
}

export function countsTowardCapacity(assignment) {
  return assignment.values.DoesCountTowardShiftCapacity === true && assignment.values.Status !== 'Canceled'
}

export function shiftCapacity(records, shift) {
  const all = shiftAssignments(records, shift.id)
  const counted = all.filter(countsTowardCapacity)
  const capacity = typeof shift.values.MaximumAttendeesCount === 'number' ? shift.values.MaximumAttendeesCount : null
  const remaining = capacity === null ? null : Math.max(0, capacity - counted.length)
  return {
    capacity,
    assigned: counted.length,
    total: all.length,
    remaining,
    coverage: capacity ? counted.length / capacity : null,
    isFull: capacity !== null && remaining === 0,
    assignments: all,
  }
}

// Values for 'Computed' fields (fields.js → compute key).
export function computeField(key, record, records) {
  if (key === 'shift.assigned') return shiftAssignments(records, record.id).length
  if (key === 'shift.remaining') return shiftCapacity(records, record).remaining
  return null
}

export function shiftLabel(records, shift) {
  const job = getRecord(records, shift.values.JobPositionId)
  const v = shift.values
  return `${job ? job.values.Name : 'Shift'} · ${v.StartDate ?? '?'} ${v.StartTime ?? ''}–${v.EndTime ?? ''}`
}

// Values for a new Job Position Assignment — the same fields Salesforce fills from the shift:
// job position and initiative come from the shift's job position.
export function assignmentValues(records, { accountId, shiftId, jobPositionId }) {
  const shift = getRecord(records, shiftId)
  const jobId = shift?.values.JobPositionId ?? jobPositionId
  const job = getRecord(records, jobId)
  const v = shift?.values ?? {}
  return {
    AssignedAccountId: accountId,
    JobPositionId: jobId,
    AssignedPositionShiftId: shift ? shift.id : undefined,
    RelatedVolunteerInitiativeId: job?.values.VolunteerInitiativeId,
    Status: 'Upcoming',
    DoesCountTowardShiftCapacity: Boolean(shift),
    ScheduledStartTime: v.StartDate && v.StartTime ? `${v.StartDate}T${v.StartTime}` : undefined,
    ScheduledEndTime: (v.EndDate ?? v.StartDate) && v.EndTime ? `${v.EndDate ?? v.StartDate}T${v.EndTime}` : undefined,
  }
}

// Can these volunteers be assigned to the shift? Official: you can select volunteers
// up to the shift's maximum attendees. Also refuses duplicate assignments to one shift.
export function checkAssignment(records, shiftId, accountIds) {
  const shift = getRecord(records, shiftId)
  if (!shift) return { ok: true, errors: [] }
  const { remaining, capacity } = shiftCapacity(records, shift)
  const already = new Set(
    shiftAssignments(records, shiftId)
      .filter((a) => a.values.Status !== 'Canceled')
      .map((a) => a.values.AssignedAccountId),
  )
  const errors = []
  const duplicates = accountIds.filter((id) => already.has(id))
  if (duplicates.length) errors.push(`${duplicates.length} selected volunteer(s) are already assigned to this shift.`)
  if (capacity !== null && accountIds.length > remaining) {
    errors.push(`Only ${remaining} seat${remaining === 1 ? '' : 's'} left on this shift (capacity ${capacity}).`)
  }
  return { ok: errors.length === 0, errors }
}
