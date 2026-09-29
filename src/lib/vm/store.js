// Record store — pure operations over { version, records }.
// The React provider (components/vm/VmStoreContext.jsx) holds the state and calls these.
//
// Rules the store enforces (Salesforce-like, for learning):
// - Every write is validated; a write with errors is refused, never partly applied.
// - Relationship fields hold record IDs only.
// - AutoNumber names and field defaults are filled in on create.
// - Creating a Person Account also creates its Contact (the ERD's standard link).
//   Deleting either one deletes the other.
// - Delete: master-detail children and standard-link records are deleted with the parent;
//   a child with a REQUIRED lookup blocks the delete; optional lookups are cleared.

import { getObject, relationshipFieldApiName, relationships } from '../../data/npc-vm/index.js'
import { seedRecords } from '../../data/npc-vm/seedData.js'
import { displayName, getRecord } from './records.js'
import { isEmpty, validateStore, validateValues } from './validation.js'

export const STORE_VERSION = 1
export const STORAGE_KEY = 'sfsh.vm.store.v1'

export function demoState() {
  return { version: STORE_VERSION, records: structuredClone(seedRecords) }
}

export function emptyState() {
  return { version: STORE_VERSION, records: {} }
}

// ---------- IDs and names ----------

function nextSeq(records, prefix) {
  let max = 0
  for (const id of Object.keys(records)) {
    if (id.startsWith(prefix)) max = Math.max(max, Number(id.slice(prefix.length)) || 0)
  }
  return max + 1
}

export function nextId(records, objectApiName) {
  const { idPrefix } = getObject(objectApiName)
  return `${idPrefix}${String(nextSeq(records, idPrefix)).padStart(3, '0')}`
}

function autoNumber(object, id) {
  return `${object.idPrefix}-${id.slice(object.idPrefix.length).padStart(4, '0')}`
}

// Drop empty values so records stay small; keep false / 0.
function clean(values) {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => !isEmpty(v)))
}

function now() {
  return new Date().toISOString()
}

// ---------- Create / update ----------

export function withDefaults(objectApiName, values) {
  const object = getObject(objectApiName)
  const result = { ...values }
  for (const field of object.fields) {
    if (field.defaultValue !== undefined && isEmpty(result[field.apiName])) result[field.apiName] = field.defaultValue
  }
  return result
}

export function createRecord(state, objectApiName, input, { origin = 'user' } = {}) {
  const object = getObject(objectApiName)
  if (!object) return { ok: false, errors: [`Unknown object "${objectApiName}"`], fieldErrors: {} }

  const values = clean(withDefaults(objectApiName, input))
  const { fieldErrors, errors } = validateValues(state.records, objectApiName, values)
  if (errors.length || Object.keys(fieldErrors).length) return { ok: false, errors, fieldErrors }

  const records = { ...state.records }
  const id = nextId(records, objectApiName)
  const nameField = object.fields.find((f) => f.apiName === 'Name')
  if (nameField?.type === 'AutoNumber') values.Name = autoNumber(object, id)
  const timestamp = now()
  records[id] = { id, objectApiName, values, origin, createdAt: timestamp, updatedAt: timestamp }

  const created = [id]
  // Person Account → its Contact, linked through the standard link (Account.PersonContactId).
  // Contact.AccountId stays empty: on the ERD that lookup belongs to Business Accounts.
  if (objectApiName === 'Account' && values.AccountType === 'Person Account') {
    const contactId = nextId(records, 'Contact')
    const parts = String(values.Name).trim().split(/\s+/)
    const LastName = parts.pop()
    records[contactId] = {
      id: contactId,
      objectApiName: 'Contact',
      values: clean({ FirstName: parts.join(' '), LastName, Email: values.PersonEmail, Phone: values.Phone }),
      origin,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    records[id] = { ...records[id], values: { ...values, PersonContactId: contactId } }
    created.push(contactId)
  }

  return { ok: true, id, created, state: { ...state, records }, errors: [], fieldErrors: {} }
}

export function updateRecord(state, id, input) {
  const existing = getRecord(state.records, id)
  if (!existing) return { ok: false, errors: [`Record ${id} doesn’t exist.`], fieldErrors: {} }
  const object = getObject(existing.objectApiName)
  // Keep system-maintained values (AutoNumber name, standard links) from the existing record.
  const kept = Object.fromEntries(
    object.fields
      .filter((f) => ['AutoNumber', 'StandardLink'].includes(f.type))
      .map((f) => [f.apiName, existing.values[f.apiName]]),
  )
  const values = clean({ ...input, ...kept })
  const { fieldErrors, errors } = validateValues(state.records, existing.objectApiName, values)
  if (errors.length || Object.keys(fieldErrors).length) return { ok: false, errors, fieldErrors }
  const records = { ...state.records, [id]: { ...existing, values, updatedAt: now() } }
  return { ok: true, id, state: { ...state, records }, errors: [], fieldErrors: {} }
}

// ---------- Delete ----------

// What deleting a record would do, without doing it.
export function deletePlan(records, id) {
  const plan = { remove: [], clear: [], blocked: [] }
  const visit = (recordId) => {
    if (plan.remove.includes(recordId)) return
    const record = getRecord(records, recordId)
    if (!record) return
    plan.remove.push(recordId)
    for (const r of relationships) {
      const fieldApiName = relationshipFieldApiName(r)
      if (r.type === 'StandardLink') {
        // Deleting a person account deletes its contact, and vice versa.
        if (r.child === record.objectApiName && record.values[fieldApiName]) visit(record.values[fieldApiName])
        if (r.parent === record.objectApiName) {
          for (const other of Object.values(records)) {
            if (other.objectApiName === r.child && other.values[fieldApiName] === recordId) visit(other.id)
          }
        }
        continue
      }
      if (r.parent !== record.objectApiName) continue
      for (const child of Object.values(records)) {
        if (child.objectApiName !== r.child || child.values[fieldApiName] !== recordId) continue
        const field = getObject(r.child).fields.find((f) => f.apiName === fieldApiName)
        if (r.type === 'MasterDetail') visit(child.id)
        else if (field.required) plan.blocked.push({ record: child, field, parentId: recordId })
        else plan.clear.push({ record: child, field })
      }
    }
  }
  visit(id)
  // A blocker that is itself being deleted doesn't block; a clear on a deleted record is moot.
  plan.blocked = plan.blocked.filter((b) => !plan.remove.includes(b.record.id))
  plan.clear = plan.clear.filter((c) => !plan.remove.includes(c.record.id))
  return plan
}

export function deleteRecord(state, id) {
  const plan = deletePlan(state.records, id)
  if (plan.blocked.length) {
    return {
      ok: false,
      plan,
      errors: plan.blocked.map(
        (b) => `${displayName(b.record)} (${getObject(b.record.objectApiName).label}) requires ${b.field.label}. Change or delete it first.`,
      ),
    }
  }
  const records = { ...state.records }
  for (const removeId of plan.remove) delete records[removeId]
  for (const { record, field } of plan.clear) {
    const values = { ...records[record.id].values }
    delete values[field.apiName]
    records[record.id] = { ...records[record.id], values, updatedAt: now() }
  }
  return { ok: true, plan, state: { ...state, records }, errors: [] }
}

// ---------- Persistence ----------

// Load saved state. Never silently repairs: invalid data is reported, and demo data is used.
export function loadState() {
  let raw = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { state: demoState(), issues: [], storage: 'unavailable' }
  }
  if (!raw) return { state: demoState(), issues: [], storage: 'empty' }
  try {
    const saved = JSON.parse(raw)
    if (saved?.version !== STORE_VERSION || typeof saved.records !== 'object') {
      return { state: demoState(), issues: ['Saved lab data is from an older version and was not loaded.'], storage: 'invalid' }
    }
    const issues = validateStore(saved.records)
    if (issues.length) return { state: demoState(), issues, storage: 'invalid', saved }
    return { state: saved, issues: [], storage: 'loaded' }
  } catch {
    return { state: demoState(), issues: ['Saved lab data could not be read.'], storage: 'invalid' }
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
