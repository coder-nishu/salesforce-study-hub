// Builds everything the NPC Volunteer Management Lab UI needs from the raw schema:
// lookup maps, parents / children per object, relationship-generated fields,
// totals, plain-language descriptions, and schema validation.
//
// Components import from here only — never from the raw files.
// Explicit `.js` extensions so `npm run vm:validate` can run this under plain Node.

import { areas } from './areas.js'
import { objects as rawObjects } from './objects.js'
import { relationships } from './relationships.js'

const RELATIONSHIP_TYPES = ['Lookup', 'MasterDetail', 'StandardLink']
const CARDINALITIES = ['one', 'zero-or-one', 'many', 'one-or-many']

export const TYPE_LABELS = {
  Lookup: 'Lookup',
  MasterDetail: 'Master-Detail',
  StandardLink: 'Standard link',
}

export const TYPE_SHORT = { Lookup: 'LK', MasterDetail: 'MD', StandardLink: 'STD' }

// ---------- Validation ----------

// Returns a list of human-readable problems. Empty list = valid.
export function validateSchema() {
  const errors = []
  const areaIds = new Set(areas.map((a) => a.id))
  const seenObjects = new Set()

  for (const obj of rawObjects) {
    if (seenObjects.has(obj.apiName)) errors.push(`Duplicate object apiName "${obj.apiName}"`)
    seenObjects.add(obj.apiName)
    if (!areaIds.has(obj.area)) errors.push(`Object "${obj.apiName}" has unknown area "${obj.area}"`)
  }

  const seenRelationships = new Set()
  const oneOfGroups = new Map() // "<child>|<group>" → count

  for (const r of relationships) {
    if (seenRelationships.has(r.id)) errors.push(`Duplicate relationship id "${r.id}"`)
    seenRelationships.add(r.id)
    if (!seenObjects.has(r.child)) errors.push(`Relationship "${r.id}" references unknown child "${r.child}"`)
    if (!seenObjects.has(r.parent)) errors.push(`Relationship "${r.id}" references unknown parent "${r.parent}"`)
    if (!RELATIONSHIP_TYPES.includes(r.type)) errors.push(`Relationship "${r.id}" has unknown type "${r.type}"`)
    if (!CARDINALITIES.includes(r.parentCardinality)) errors.push(`Relationship "${r.id}" has unknown parentCardinality "${r.parentCardinality}"`)
    if (!CARDINALITIES.includes(r.childCardinality)) errors.push(`Relationship "${r.id}" has unknown childCardinality "${r.childCardinality}"`)
    if (!['erd', 'verify'].includes(r.confidence)) errors.push(`Relationship "${r.id}" has unknown confidence "${r.confidence}"`)
    if (r.constraint) {
      if (r.constraint.type !== 'oneOf') errors.push(`Relationship "${r.id}" has unknown constraint type "${r.constraint.type}"`)
      const key = `${r.child}|${r.constraint.group}`
      oneOfGroups.set(key, (oneOfGroups.get(key) ?? 0) + 1)
    }
  }

  for (const [key, count] of oneOfGroups) {
    if (count < 2) {
      const [child, group] = key.split('|')
      errors.push(`oneOf group "${group}" on "${child}" has ${count} member (needs at least 2)`)
    }
  }

  return errors
}

export const schemaErrors = validateSchema()
if (schemaErrors.length) {
  console.error(`[npc-vm] Schema validation failed:\n- ${schemaErrors.join('\n- ')}`)
}

// ---------- Lookup maps ----------

export const areasById = new Map(areas.map((a) => [a.id, a]))
const rawByApiName = new Map(rawObjects.map((o) => [o.apiName, o]))
const labelOf = (apiName) => rawByApiName.get(apiName)?.label ?? apiName

function fieldFromRelationship(r) {
  const label = r.fieldLabel ?? labelOf(r.parent)
  return {
    apiName: `${label.replace(/[^A-Za-z0-9]/g, '')}Id`,
    apiNameStatus: 'provisional',
    label,
    type: r.type,
    typeLabel: `${TYPE_LABELS[r.type]}(${labelOf(r.parent)})`,
    referenceTo: r.parent,
    // Master-detail is always required; a lookup is required when the ERD shows
    // "one" (bar) rather than "zero or one" (circle + bar) at the parent end.
    required: r.type === 'MasterDetail' || r.parentCardinality === 'one',
    source: 'erd',
    relationshipId: r.id,
    confidence: r.confidence,
    constraint: r.constraint,
  }
}

function buildObject(raw) {
  const own = relationships.filter((r) => r.child === raw.apiName && r.type !== 'StandardLink')
  const parents = own
  const children = relationships.filter(
    (r) => r.parent === raw.apiName && r.child !== raw.apiName && r.type !== 'StandardLink',
  )
  const selfReferences = own.filter((r) => r.parent === raw.apiName)
  const standardLinks = relationships
    .filter((r) => r.type === 'StandardLink' && (r.child === raw.apiName || r.parent === raw.apiName))
    .map((r) => ({ ...r, other: r.child === raw.apiName ? r.parent : r.child }))

  // oneOf constraints on this object's own lookups, grouped.
  const constraintGroups = new Map()
  for (const r of own) {
    if (!r.constraint) continue
    const list = constraintGroups.get(r.constraint.group) ?? []
    list.push(r)
    constraintGroups.set(r.constraint.group, list)
  }
  const constraints = [...constraintGroups].map(([group, rels]) => ({
    type: 'oneOf',
    group,
    relationships: rels,
    targets: rels.map((r) => r.parent),
  }))

  const related = new Set([
    ...parents.map((r) => r.parent),
    ...children.map((r) => r.child),
    ...standardLinks.map((l) => l.other),
  ])
  related.delete(raw.apiName)

  return {
    ...raw,
    fields: [...raw.fields, ...own.map(fieldFromRelationship)],
    parents,
    children,
    selfReferences,
    standardLinks,
    constraints,
    relatedObjects: [...related],
  }
}

export const objects = rawObjects.map(buildObject)
export const objectsByApiName = new Map(objects.map((o) => [o.apiName, o]))
export const objectsByArea = new Map(
  areas.map((a) => [a.id, objects.filter((o) => o.area === a.id)]),
)
export { areas, relationships }

export function getObject(apiName) {
  return objectsByApiName.get(apiName) ?? null
}

// ---------- Totals ----------

export const totals = {
  objects: objects.length,
  relationships: relationships.length,
  lookups: relationships.filter((r) => r.type === 'Lookup').length,
  masterDetails: relationships.filter((r) => r.type === 'MasterDetail').length,
  standardLinks: relationships.filter((r) => r.type === 'StandardLink').length,
  standardObjects: objects.filter((o) => o.isStandard).length,
  licenseObjects: objects.filter((o) => !o.isStandard).length,
  crossArea: relationships.filter(
    (r) => rawByApiName.get(r.child)?.area !== rawByApiName.get(r.parent)?.area,
  ).length,
  toVerify: relationships.filter((r) => r.confidence === 'verify').length,
  areas: areas.length,
}

// ---------- Plain-language descriptions (generated, never hand-written) ----------

const PARENT_AMOUNT = { one: 'exactly one', 'zero-or-one': 'at most one' }
const CHILD_AMOUNT = {
  many: 'zero or many',
  'one-or-many': 'one or many',
  'zero-or-one': 'at most one',
  one: 'exactly one',
}

// "a Job Position" / "an Examination"
export function withArticle(label, capital = false) {
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a'
  return `${capital ? article[0].toUpperCase() + article.slice(1) : article} ${label}`
}

// "A Job Position Assignment looks up to at most one Job Position."
export function describeFromChild(r) {
  const child = labelOf(r.child)
  const parent = labelOf(r.parent)
  if (r.type === 'StandardLink') return `${child} and ${parent} are linked one-to-one (standard link).`
  if (r.child === r.parent) return `${withArticle(child, true)} can point to at most one parent ${parent}.`
  const verb = r.type === 'MasterDetail' ? 'belongs to' : 'looks up to'
  return `${withArticle(child, true)} ${verb} ${PARENT_AMOUNT[r.parentCardinality]} ${parent}.`
}

// "A Job Position can have zero or many Job Position Assignment records."
export function describeFromParent(r) {
  const child = labelOf(r.child)
  const parent = labelOf(r.parent)
  const amount = CHILD_AMOUNT[r.childCardinality]
  const tail = r.type === 'MasterDetail' ? ', deleted with it (master-detail)' : ''
  return `${withArticle(parent, true)} can have ${amount} ${child} ${r.childCardinality === 'zero-or-one' || r.childCardinality === 'one' ? 'record' : 'records'}${tail}.`
}

export function labelFor(apiName) {
  return labelOf(apiName)
}
