// Dashboard metrics — every number is computed from the current records.
// Each metric carries its definition so the UI can show exactly what is counted.

import { totals } from '../../data/npc-vm/index.js'
import { shiftCapacity } from './capacity.js'
import { findVolunteers, requirementsFor, volunteers } from './matching.js'
import { recordsOf } from './records.js'

const ACTIVE_SHIFT = ['Upcoming', 'In Progress']

export function computeMetrics(records) {
  const shifts = recordsOf(records, 'JobPositionShift')
  const activeShifts = shifts.filter((s) => ACTIVE_SHIFT.includes(s.values.Status ?? 'Upcoming'))
  const capacities = activeShifts.map((s) => ({ shift: s, ...shiftCapacity(records, s) }))
  const withCapacity = capacities.filter((c) => c.capacity !== null)
  const totalCapacity = withCapacity.reduce((n, c) => n + c.capacity, 0)
  const totalAssigned = withCapacity.reduce((n, c) => n + c.assigned, 0)
  const people = volunteers(records)
  const availabilityOwners = new Set(recordsOf(records, 'PersonLocationAvailability').map((p) => p.values.AccountId))

  // A volunteer is "qualified" if they meet all evaluated qualifications of at least one active shift's job.
  const qualified = new Set()
  for (const { shift } of capacities) {
    const reqs = requirementsFor(records, shift.values.JobPositionId).filter((r) => r.evaluated)
    if (!reqs.length) continue
    const { results } = findVolunteers(records, { jobPositionId: shift.values.JobPositionId, requirementIds: reqs.map((r) => r.id), time: null, byLocation: false })
    for (const r of results) if (r.match) qualified.add(r.account.id)
  }

  const count = (apiName) => recordsOf(records, apiName).length

  return {
    model: [
      { label: 'Objects', value: totals.objects, definition: 'Objects in the learning data model (from the ERD).' },
      { label: 'Relationships', value: totals.relationships, definition: 'Relationships in the data model.' },
      { label: 'Records', value: Object.keys(records).length, definition: 'All records currently in the lab.' },
    ],
    records: [
      { label: 'Volunteers', value: people.length, definition: 'Accounts with Account Type = Person Account.' },
      { label: 'Competencies', value: count('Competency'), definition: 'Competency records (skill definitions).' },
      { label: 'Positions', value: count('Position'), definition: 'Position records (reusable roles).' },
      { label: 'Job Positions', value: count('JobPosition'), definition: 'Job Position records (roles inside an initiative).' },
      { label: 'Initiatives', value: count('VolunteerInitiative'), definition: 'Volunteer Initiative records.' },
      { label: 'Shifts', value: shifts.length, definition: 'Job Position Shift records.' },
      { label: 'Assignments', value: count('JobPositionAssignment'), definition: 'Job Position Assignment records.' },
    ],
    operations: [
      { label: 'Open shifts', value: capacities.filter((c) => c.capacity === null || c.remaining > 0).length, definition: 'Upcoming / In Progress shifts with seats left (or no maximum set).' },
      { label: 'Filled shifts', value: capacities.filter((c) => c.isFull).length, definition: 'Upcoming / In Progress shifts where counted assignments = Maximum Attendees.' },
      { label: 'Unfilled shifts', value: capacities.filter((c) => c.assigned === 0).length, definition: 'Upcoming / In Progress shifts with no assignment counting toward capacity.' },
      {
        label: 'Coverage',
        value: totalCapacity ? `${Math.round((totalAssigned / totalCapacity) * 100)}%` : '—',
        definition: `Counted assignments ÷ total Maximum Attendees across active shifts (${totalAssigned} of ${totalCapacity}).`,
      },
      { label: 'Available volunteers', value: people.filter((p) => availabilityOwners.has(p.id)).length, definition: 'Volunteers with at least one Person Location Availability.' },
      { label: 'Qualified volunteers', value: qualified.size, definition: 'Volunteers meeting every evaluated qualification of at least one active shift’s job position.' },
    ],
    shifts: capacities,
  }
}
