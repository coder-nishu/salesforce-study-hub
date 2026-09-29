// Builds everything the NPC Volunteer Management Lab UI needs from the raw schema:
// lookup maps, parents / children per object, relationship-generated fields,
// totals, plain-language descriptions, and schema validation.
//
// Components import from here only — never from the raw files.
// Explicit `.js` extensions so `npm run vm:validate` can run this under plain Node.

import { areas } from './areas.js'
import { objectConfig } from './fields.js'
import { objects as rawObjects } from './objects.js'
import { relationships } from './relationships.js'

const RELATIONSHIP_TYPES = ['Lookup', 'MasterDetail', 'StandardLink']
const CARDINALITIES = ['one', 'zero-or-one', 'many', 'one-or-many']
const CONFIDENCES = ['erd', 'official', 'verify']

export const FIELD_TYPES = [
  'Text', 'LongText', 'Number', 'Currency', 'Percent', 'Date', 'Time', 'DateTime', 'Checkbox',
  'Email', 'Phone', 'URL', 'Picklist', 'AutoNumber', 'Computed',
  'Lookup', 'MasterDetail', 'StandardLink',
]

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
    if (!CONFIDENCES.includes(r.confidence)) errors.push(`Relationship "${r.id}" has unknown confidence "${r.confidence}"`)
    if (r.constraint) {
      if (r.constraint.type !== 'oneOf') errors.push(`Relationship "${r.id}" has unknown constraint type "${r.constraint.type}"`)
      const key = `${r.child}|${r.constraint.group}`
      oneOfGroups.set(key, (oneOfGroups.get(key) ?? 0) + 1)
    }
  }

  // Record settings and field definitions (fields.js)
  const prefixes = new Map()
  for (const obj of rawObjects) {
    const config = objectConfig[obj.apiName]
    if (!config) {
      errors.push(`Object "${obj.apiName}" has no entry in fields.js`)
      continue
    }
    if (!/^[A-Z]{3}$/.test(config.idPrefix ?? '')) errors.push(`Object "${obj.apiName}" needs a 3-letter idPrefix`)
    else if (prefixes.has(config.idPrefix)) errors.push(`idPrefix "${config.idPrefix}" is used by both "${prefixes.get(config.idPrefix)}" and "${obj.apiName}"`)
    else prefixes.set(config.idPrefix, obj.apiName)
    const seenFields = new Set()
    for (const field of config.fields) {
      if (seenFields.has(field.apiName)) errors.push(`Duplicate field "${obj.apiName}.${field.apiName}"`)
      seenFields.add(field.apiName)
      if (!FIELD_TYPES.includes(field.type)) errors.push(`Field "${obj.apiName}.${field.apiName}" has unknown type "${field.type}"`)
      if (field.type === 'Picklist' && !field.options?.length) errors.push(`Picklist "${obj.apiName}.${field.apiName}" has no options`)
    }
    const names = [config.nameField ?? 'Name'].flat()
    for (const name of names) {
      if (!seenFields.has(name)) errors.push(`Object "${obj.apiName}" nameField "${name}" is not a defined field`)
    }
  }
  for (const key of Object.keys(objectConfig)) {
    if (!seenObjects.has(key)) errors.push(`fields.js has settings for unknown object "${key}"`)
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

// The lookup field API name for a relationship: official name, else label + "Id" (provisional).
export function relationshipFieldApiName(r) {
  return r.fieldApiName ?? `${(r.fieldLabel ?? labelOf(r.parent)).replace(/[^A-Za-z0-9]/g, '')}Id`
}

// Required flag for a relationship field and where it comes from.
function requiredFor(r) {
  // Standard links are maintained automatically (e.g. a person account's contact).
  if (r.type === 'StandardLink') return { required: false, requiredSource: 'standard-link' }
  if (r.type === 'MasterDetail') return { required: true, requiredSource: 'master-detail' }
  if (typeof r.officialRequired === 'boolean') {
    const erdRequired = r.parentCardinality === 'one'
    return {
      required: r.officialRequired,
      requiredSource: 'official',
      requiredDiffers: r.officialRequired !== erdRequired,
    }
  }
  return { required: r.parentCardinality === 'one', requiredSource: 'erd' }
}

// One field per (child, fieldApiName). Two relationships sharing a field = polymorphic lookup.
function fieldsFromRelationships(own) {
  const byField = new Map()
  for (const r of own) {
    const apiName = relationshipFieldApiName(r)
    const existing = byField.get(apiName)
    if (existing) {
      existing.targets.push(r.parent)
      existing.relationshipIds.push(r.id)
      existing.polymorphic = true
      existing.typeLabel = `${TYPE_LABELS[r.type]}(${existing.targets.map(labelOf).join(' | ')})`
      continue
    }
    byField.set(apiName, {
      apiName,
      apiNameStatus: r.fieldStatus,
      label: r.fieldLabel ?? labelOf(r.parent),
      type: r.type,
      typeLabel: `${TYPE_LABELS[r.type]}(${labelOf(r.parent)})`,
      targets: [r.parent],
      referenceTo: r.parent,
      polymorphic: false,
      ...requiredFor(r),
      sourceStatus: 'erd',
      relationshipId: r.id,
      relationshipIds: [r.id],
      confidence: r.confidence,
      constraint: r.constraint,
      readOnly: r.type === 'StandardLink',
    })
  }
  return [...byField.values()]
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

  const config = objectConfig[raw.apiName] ?? { fields: raw.fields }
  const standardLinkFields = relationships.filter((r) => r.type === 'StandardLink' && r.child === raw.apiName)
  const API_NAME_STATUS = { official: 'official', 'assumed-standard': 'standard' }
  const ownFields = config.fields.map((field) => ({
    ...field,
    apiNameStatus: API_NAME_STATUS[field.sourceStatus] ?? 'provisional',
  }))
  const hasSourcedFields = config.fields.some((field) => field.sourceStatus !== 'assumed-standard')

  return {
    ...raw,
    // An object with an official reference page has a verified API name.
    apiNameStatus: raw.isStandard ? 'standard' : config.sourceRef ? 'official' : raw.apiNameStatus,
    idPrefix: config.idPrefix,
    nameField: config.nameField ?? 'Name',
    listFields: config.listFields ?? [],
    sourceRef: config.sourceRef ?? null,
    fieldsStatus: hasSourcedFields ? 'sourced' : 'todo',
    fields: [...ownFields, ...fieldsFromRelationships([...own, ...standardLinkFields])],
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

export function getField(objectApiName, fieldApiName) {
  return getObject(objectApiName)?.fields.find((field) => field.apiName === fieldApiName) ?? null
}

// Which object a record ID belongs to, from its 3-letter prefix (e.g. "JPS003" → JobPositionShift).
const objectByPrefix = new Map(objects.map((o) => [o.idPrefix, o.apiName]))
export function objectForId(id) {
  return typeof id === 'string' ? objectByPrefix.get(id.slice(0, 3)) ?? null : null
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
  officiallyConfirmed: relationships.filter((r) => r.confidence === 'official').length,
  fields: objects.reduce((n, o) => n + o.fields.length, 0),
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
