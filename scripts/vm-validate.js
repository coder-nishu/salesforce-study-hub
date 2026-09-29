// Validates the NPC Volunteer Management schema and prints counts.
// Usage: npm run vm:validate
import { objects, relationships, schemaErrors, totals } from '../src/data/npc-vm/index.js'
import { seedRecords } from '../src/data/npc-vm/seedData.js'
import { validateStore } from '../src/lib/vm/validation.js'
import { findVolunteers, requirementsFor } from '../src/lib/vm/matching.js'

// 35 boxes on the ERD: Application 6, Action Plans 6, Program Management 1, Volunteer 10, Volunteer Management 12.
const EXPECTED_OBJECTS = 35

const problems = [...schemaErrors]
if (totals.objects !== EXPECTED_OBJECTS) {
  problems.push(`Expected ${EXPECTED_OBJECTS} objects, found ${totals.objects}`)
}
const orphans = objects.filter((o) => o.relatedObjects.length === 0).map((o) => o.apiName)
if (orphans.length) problems.push(`Objects with no relationships: ${orphans.join(', ')}`)

// Demo data must satisfy the same rules as user-created records.
const seedIssues = validateStore(seedRecords)
problems.push(...seedIssues.map((issue) => `Demo data: ${issue}`))

// Matching must teach the intended lessons on the demo data (see seedData.js).
function expectMatch(label, criteria, expected) {
  const { results } = findVolunteers(seedRecords, criteria)
  for (const [name, check] of Object.entries(expected)) {
    const result = results.find((r) => r.account.values.Name === name)
    const actual = result && { match: result.match, qualification: result.qualification.ok, time: result.time.ok, location: result.location.ok }
    for (const [key, value] of Object.entries(check)) {
      if (!actual || actual[key] !== value) problems.push(`Matching (${label}): expected ${name}.${key} = ${value}, got ${actual?.[key]}`)
    }
  }
}
const allRequirements = (jobId) => requirementsFor(seedRecords, jobId).map((r) => r.id)
expectMatch('Health Camp First Aid, Sat morning', { jobPositionId: 'JOB001', requirementIds: allRequirements('JOB001'), time: { shiftId: 'JPS001' }, byLocation: true }, {
  'Sarah Ahmed': { match: true },
  'John Rahman': { match: false, qualification: false, time: true, location: true },
  'Maria Khan': { match: false, qualification: true, time: false },
  'Nadia Chowdhury': { match: false, qualification: true, time: true, location: false },
  'David Islam': { match: false, qualification: false },
})
expectMatch('Food Drive', { jobPositionId: 'JOB004', requirementIds: allRequirements('JOB004'), time: { shiftId: 'JPS004' }, byLocation: true }, {
  'David Islam': { match: true },
})
if (!findVolunteers(seedRecords, { jobPositionId: 'JOB001', requirementIds: [], time: null, byLocation: false }).noCriteria) {
  problems.push('Matching: with no criteria selected, no volunteers should appear')
}

console.log('NPC Volunteer Management schema')
console.log(`  Objects:        ${totals.objects} (${totals.standardObjects} standard, ${totals.licenseObjects} included in license)`)
console.log(`  Areas:          ${totals.areas}`)
console.log(`  Relationships:  ${totals.relationships} (${totals.lookups} lookup, ${totals.masterDetails} master-detail, ${totals.standardLinks} standard link)`)
console.log(`  Cross-area:     ${totals.crossArea}`)
console.log(`  Fields:         ${totals.fields}`)
console.log(`  Confirmed:      ${totals.officiallyConfirmed} relationships confirmed by official references`)
console.log(`  Demo records:   ${Object.keys(seedRecords).length}`)
console.log(`  To verify:      ${totals.toVerify}`)
for (const r of relationships.filter((r) => r.confidence === 'verify')) {
  console.log(`    - ${r.id}: ${r.child} → ${r.parent}`)
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`)
  process.exit(1)
}
console.log('\n✓ Schema, demo data and matching assertions valid')
