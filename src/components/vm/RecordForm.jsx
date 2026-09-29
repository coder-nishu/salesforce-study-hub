import { useId, useState } from 'react'
import { getObject, labelFor } from '../../data/npc-vm'
import { fieldWhy } from '../../data/npc-vm/learning'
import { withDefaults } from '../../lib/vm/store'
import { isEditable } from '../../lib/vm/validation'
import FieldInput from './FieldInput'
import SourceBadge from './SourceBadge'
import { RelTypeBadge } from './VmBadges'

// Generic record form, generated from field metadata. onSubmit(values) must return the
// store result ({ ok, fieldErrors, errors }) so validation messages can be shown inline.
export default function RecordForm({ objectApiName, initialValues = {}, isNew = true, submitLabel = 'Save', onSubmit, onCancel }) {
  const object = getObject(objectApiName)
  const formId = useId()
  const [values, setValues] = useState(() => (isNew ? withDefaults(objectApiName, initialValues) : initialValues))
  const [fieldErrors, setFieldErrors] = useState({})
  const [errors, setErrors] = useState([])

  const editable = object.fields.filter(isEditable)
  const detailFields = editable.filter((f) => !f.targets)
  const relationshipFields = editable.filter((f) => f.targets)
  const systemFields = object.fields.filter((f) => !isEditable(f))

  const set = (apiName) => (value) => {
    setValues((prev) => ({ ...prev, [apiName]: value }))
    setFieldErrors((prev) => ({ ...prev, [apiName]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = onSubmit(values)
    if (result && !result.ok) {
      setFieldErrors(result.fieldErrors ?? {})
      setErrors(result.errors ?? [])
    }
  }

  const renderField = (field) => {
    const inputId = `${formId}-${field.apiName}`
    const why = fieldWhy(objectApiName, field.apiName)
    const error = fieldErrors[field.apiName]
    return (
      <div key={field.apiName} className={`vm-form-field${error ? ' has-error' : ''}`}>
        {field.type !== 'Checkbox' && (
          <label htmlFor={inputId} className="vm-form-label">
            {field.label}
            {field.required && <span className="vm-required" aria-label="required">*</span>}
            {field.targets && <RelTypeBadge type={field.type} />}
            {field.polymorphic && <span className="vm-badge vm-badge-oneof">one of</span>}
          </label>
        )}
        <FieldInput field={field} value={values[field.apiName]} onChange={set(field.apiName)} error={error} inputId={inputId} />
        {field.type === 'MasterDetail' && (
          <p className="vm-form-hint">
            Master-detail: this record belongs to its {labelFor(field.targets[0])} and is deleted with it.
          </p>
        )}
        {field.polymorphic && <p className="vm-form-hint">References a {field.targets.map(labelFor).join(' OR a ')} — choose one.</p>}
        {why && (
          <p className="vm-form-hint">
            <SourceBadge source={why.source} /> {why.text}
          </p>
        )}
        {error && <p className="vm-form-error">{error}</p>}
      </div>
    )
  }

  return (
    <form className="vm-form" onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <div className="vm-form-alert" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      {Object.values(fieldErrors).some(Boolean) && (
        <div className="vm-form-alert" role="alert">
          <p>Review the highlighted fields.</p>
        </div>
      )}

      <fieldset className="vm-form-section">
        <legend>Details</legend>
        <div className="vm-form-grid">{detailFields.map(renderField)}</div>
      </fieldset>

      {relationshipFields.length > 0 && (
        <fieldset className="vm-form-section">
          <legend>Relationships</legend>
          <p className="vm-form-hint">Relationship fields store the related record’s ID; you pick the record by name.</p>
          <div className="vm-form-grid">{relationshipFields.map(renderField)}</div>
        </fieldset>
      )}

      {systemFields.length > 0 && (
        <p className="vm-form-hint">
          Set automatically: {systemFields.map((f) => f.label).join(', ')}.
          {objectApiName === 'Account' && values.AccountType === 'Person Account' && isNew && ' A Contact is created with a new Person Account (standard link).'}
        </p>
      )}

      <div className="vm-form-actions">
        <button type="submit" className="vm-button vm-button-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="vm-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
