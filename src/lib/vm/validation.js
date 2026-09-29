// Record validation — used on every write and when loading saved data.
// Returns friendly messages; the store refuses writes that have errors.

import { getObject, labelFor, objectForId } from '../../data/npc-vm/index.js'
import { displayName, getRecord } from './records.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DATETIME = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/

export function isEmpty(value) {
  return value === undefined || value === null || value === ''
}

// Fields the user fills in (not AutoNumber / Computed / maintained standard links).
export function isEditable(field) {
  return !['AutoNumber', 'Computed', 'StandardLink'].includes(field.type)
}

// Validate a record's values. Returns { fieldErrors: { apiName: message }, errors: [message] }.
export function validateValues(records, objectApiName, values) {
  const object = getObject(objectApiName)
  const fieldErrors = {}
  const errors = []
  if (!object) return { fieldErrors, errors: [`Unknown object "${objectApiName}"`] }

  const known = new Set(object.fields.map((f) => f.apiName))
  for (const key of Object.keys(values)) {
    if (!known.has(key)) errors.push(`Unknown field "${key}" on ${object.label}`)
  }

  for (const field of object.fields) {
    const value = values[field.apiName]
    if (field.type === 'Computed' || field.type === 'AutoNumber') continue

    if (isEmpty(value)) {
      if (field.required && field.type !== 'StandardLink') {
        fieldErrors[field.apiName] =
          field.type === 'MasterDetail'
            ? `Master-detail: a ${object.label} can’t exist without its ${labelFor(field.targets[0])}.`
            : `${field.label} is required.`
      }
      continue
    }

    switch (field.type) {
      case 'Number':
      case 'Currency':
      case 'Percent':
        if (typeof value !== 'number' || Number.isNaN(value)) fieldErrors[field.apiName] = `${field.label} must be a number.`
        else if (field.apiName === 'QualificationLevel' && (!Number.isInteger(value) || value < 0))
          fieldErrors[field.apiName] = 'Qualification Level is a whole number (0 or more).'
        break
      case 'Email':
        if (!EMAIL.test(value)) fieldErrors[field.apiName] = 'Enter a valid email address.'
        break
      case 'Date':
        if (!DATE.test(value)) fieldErrors[field.apiName] = 'Use the format YYYY-MM-DD.'
        break
      case 'Time':
        if (!TIME.test(value)) fieldErrors[field.apiName] = 'Use the 24-hour format HH:MM.'
        break
      case 'DateTime':
        if (!DATETIME.test(value)) fieldErrors[field.apiName] = 'Use the format YYYY-MM-DDTHH:MM.'
        break
      case 'Checkbox':
        if (typeof value !== 'boolean') fieldErrors[field.apiName] = `${field.label} must be true or false.`
        break
      case 'Picklist':
        if (!field.options.includes(value)) fieldErrors[field.apiName] = `“${value}” isn’t a valid ${field.label}.`
        break
      case 'Lookup':
      case 'MasterDetail':
      case 'StandardLink': {
        const targetObject = objectForId(value)
        if (!field.targets.includes(targetObject)) {
          fieldErrors[field.apiName] = `${field.label} must point to ${field.targets.map(labelFor).join(' or ')}.`
        } else if (!getRecord(records, value)) {
          fieldErrors[field.apiName] = `${field.label}: record ${value} doesn’t exist.`
        }
        break
      }
      default:
        break
    }
  }

  // Ranges must not end before they start. Times are only compared on the same day.
  const has = (key) => !isEmpty(values[key]) && !fieldErrors[key]
  if (has('StartDate') && has('EndDate') && values.EndDate < values.StartDate) {
    fieldErrors.EndDate = 'End Date is before Start Date.'
  }
  const sameDay = !has('EndDate') || values.EndDate === values.StartDate
  if (has('StartTime') && has('EndTime') && sameDay && values.EndTime <= values.StartTime) {
    fieldErrors.EndTime = 'End Time must be after Start Time.'
  }

  return { fieldErrors, errors }
}

// Validate a whole record map (used when loading saved data and by `npm run vm:validate`).
export function validateStore(records) {
  const issues = []
  for (const [id, record] of Object.entries(records)) {
    if (id !== record.id) issues.push(`Record key ${id} doesn’t match its id ${record.id}`)
    if (objectForId(record.id) !== record.objectApiName) {
      issues.push(`Record ${record.id} has the wrong ID prefix for ${record.objectApiName}`)
      continue
    }
    const { fieldErrors, errors } = validateValues(records, record.objectApiName, record.values)
    for (const message of [...errors, ...Object.values(fieldErrors)]) {
      issues.push(`${record.id} (${displayName(record)}): ${message}`)
    }
  }
  return issues
}
