// Validates the NPC Volunteer Management schema and prints counts.
// Usage: npm run vm:validate
import { objects, relationships, schemaErrors, totals } from '../src/data/npc-vm/index.js'

// 35 boxes on the ERD: Application 6, Action Plans 6, Program Management 1, Volunteer 10, Volunteer Management 12.
const EXPECTED_OBJECTS = 35

const problems = [...schemaErrors]
if (totals.objects !== EXPECTED_OBJECTS) {
  problems.push(`Expected ${EXPECTED_OBJECTS} objects, found ${totals.objects}`)
}
const orphans = objects.filter((o) => o.relatedObjects.length === 0).map((o) => o.apiName)
if (orphans.length) problems.push(`Objects with no relationships: ${orphans.join(', ')}`)

console.log('NPC Volunteer Management schema')
console.log(`  Objects:        ${totals.objects} (${totals.standardObjects} standard, ${totals.licenseObjects} included in license)`)
console.log(`  Areas:          ${totals.areas}`)
console.log(`  Relationships:  ${totals.relationships} (${totals.lookups} lookup, ${totals.masterDetails} master-detail, ${totals.standardLinks} standard link)`)
console.log(`  Cross-area:     ${totals.crossArea}`)
console.log(`  To verify:      ${totals.toVerify}`)
for (const r of relationships.filter((r) => r.confidence === 'verify')) {
  console.log(`    - ${r.id}: ${r.child} → ${r.parent}`)
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`)
  process.exit(1)
}
console.log('\n✓ Schema valid')
