// Relationship resolver — pure functions over the record map ({ [id]: record }).
// Records store related IDs only; everything here resolves them at read time.
// Explicit `.js` extensions so the Node validation script can import this file.

import {
  getObject,
  labelFor,
  objectForId,
  relationshipFieldApiName,
  relationships,
} from '../../data/npc-vm/index.js'

export function getRecord(records, id) {
  return (id && records[id]) || null
}

export function recordsOf(records, objectApiName) {
  return Object.values(records)
    .filter((r) => r.objectApiName === objectApiName)
    .sort((a, b) => a.id.localeCompare(b.id))
}

function formatTime(value) {
  return value ?? ''
}

// The record's display name: its name field(s), with a readable fallback.
export function displayName(record) {
  if (!record) return ''
  const object = getObject(record.objectApiName)
  const nameFields = [object?.nameField ?? 'Name'].flat()
  if (record.objectApiName === 'TimeSlot') {
    const v = record.values
    return `${v.DayOfWeek ?? '?'} ${formatTime(v.StartTime)}–${formatTime(v.EndTime)}`
  }
  const name = nameFields.map((f) => record.values[f]).filter((v) => v !== undefined && v !== null && v !== '').join(' ')
  return name || record.id
}

// Resolve a lookup value (an ID) to { id, objectApiName, record } — record is null if missing.
export function resolveRef(records, id) {
  if (!id) return null
  return { id, objectApiName: objectForId(id), record: getRecord(records, id) }
}

// Relationship fields on this record's object, with their resolved values.
export function parentRefs(records, record) {
  const object = getObject(record.objectApiName)
  return object.fields
    .filter((f) => f.targets)
    .map((field) => ({ field, ref: resolveRef(records, record.values[field.apiName]) }))
}

// Related lists: for every relationship whose PARENT is this record's object, the child
// records whose lookup field holds this record's ID. Derived — never stored.
export function relatedLists(records, record) {
  const lists = []
  for (const r of relationships) {
    if (r.parent !== record.objectApiName) continue
    const fieldApiName = relationshipFieldApiName(r)
    const items =
      r.type === 'StandardLink'
        ? [getRecord(records, record.values[fieldApiName])].filter(Boolean) // link lives on the parent side
        : recordsOf(records, r.child).filter((child) => child.values[fieldApiName] === record.id)
    lists.push({
      relationship: r,
      childObjectApiName: r.type === 'StandardLink' ? r.child : r.child,
      fieldApiName,
      label: r.child === r.parent ? `Child ${labelFor(r.child)}s` : `${labelFor(r.child)} records`,
      items,
    })
  }
  // Standard links where this object is the CHILD side (e.g. Account → Contact).
  for (const r of relationships) {
    if (r.type !== 'StandardLink' || r.child !== record.objectApiName) continue
    const linked = getRecord(records, record.values[relationshipFieldApiName(r)])
    lists.push({
      relationship: r,
      childObjectApiName: r.parent,
      fieldApiName: relationshipFieldApiName(r),
      label: `${labelFor(r.parent)} (standard link)`,
      items: linked ? [linked] : [],
    })
  }
  return lists
}

// A small tree for the Record Relationship Explorer: parents above, children below.
export function recordGraph(records, record, depth = 2, seen = new Set([record.id])) {
  const parents = parentRefs(records, record)
    .filter(({ ref }) => ref?.record)
    .map(({ field, ref }) => ({ via: field, record: ref.record }))
  const children = []
  if (depth > 0) {
    for (const list of relatedLists(records, record)) {
      for (const child of list.items) {
        if (seen.has(child.id)) continue
        seen.add(child.id)
        children.push({
          via: list,
          record: child,
          node: recordGraph(records, child, depth - 1, seen),
        })
      }
    }
  }
  return { record, parents, children }
}
