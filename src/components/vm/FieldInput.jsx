import { useState } from 'react'
import { labelFor, objectForId } from '../../data/npc-vm'
import LookupField from './LookupField'

// Renders the right input for a field's type. Values are kept in the form's value types:
// numbers as numbers, checkboxes as booleans, lookups as record IDs.
export default function FieldInput({ field, value, onChange, error, inputId }) {
  const [targetChoice, setTargetChoice] = useState(() => objectForId(value) ?? field.targets?.[0])
  const invalid = Boolean(error)
  const common = { id: inputId, 'aria-invalid': invalid || undefined }

  switch (field.type) {
    case 'Lookup':
    case 'MasterDetail': {
      if (field.polymorphic) {
        const target = objectForId(value) ?? targetChoice
        return (
          <div className="vm-polymorphic">
            <div className="vm-radio-row" role="radiogroup" aria-label={`${field.label} type`}>
              {field.targets.map((t) => (
                <label key={t}>
                  <input
                    type="radio"
                    name={`${inputId}-target`}
                    checked={target === t}
                    onChange={() => {
                      setTargetChoice(t)
                      if (objectForId(value) !== t) onChange('')
                    }}
                  />
                  {labelFor(t)}
                </label>
              ))}
            </div>
            <LookupField id={inputId} targetObject={target} value={value} onChange={onChange} invalid={invalid} />
          </div>
        )
      }
      return <LookupField id={inputId} targetObject={field.targets[0]} value={value} onChange={onChange} invalid={invalid} />
    }
    case 'Checkbox':
      return (
        <label className="vm-checkbox">
          <input {...common} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      )
    case 'Picklist':
      return (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">— None —</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )
    case 'Number':
    case 'Currency':
    case 'Percent':
      return (
        <input
          {...common}
          type="number"
          step={field.apiName === 'QualificationLevel' || field.type === 'Number' ? 1 : 'any'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )
    case 'LongText':
      return <textarea {...common} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'Date':
      return <input {...common} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'Time':
      return <input {...common} type="time" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'DateTime':
      return <input {...common} type="datetime-local" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'Email':
      return <input {...common} type="email" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'Phone':
      return <input {...common} type="tel" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'URL':
      return <input {...common} type="url" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    default:
      return <input {...common} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
}
