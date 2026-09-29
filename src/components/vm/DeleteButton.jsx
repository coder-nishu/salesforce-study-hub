import { useState } from 'react'
import { getObject } from '../../data/npc-vm'
import { displayName, getRecord } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

// Two-step delete that previews what Salesforce-like rules will do.
export default function DeleteButton({ recordId, onDeleted, compact }) {
  const { records, planDelete, remove } = useVmStore()
  const [plan, setPlan] = useState(null)
  const [errors, setErrors] = useState([])
  const record = getRecord(records, recordId)
  if (!record) return null

  if (!plan) {
    return (
      <button type="button" className={`vm-button vm-button-danger${compact ? ' is-compact' : ''}`} onClick={() => setPlan(planDelete(recordId))}>
        Delete
      </button>
    )
  }

  const others = plan.remove.filter((id) => id !== recordId)
  const label = (id) => {
    const r = getRecord(records, id)
    return `${displayName(r)} (${getObject(r.objectApiName).label})`
  }

  return (
    <div className="vm-delete-confirm" role="alertdialog" aria-label={`Delete ${displayName(record)}?`}>
      <p>
        <strong>Delete {displayName(record)}?</strong>
      </p>
      {plan.blocked.length > 0 ? (
        <>
          <p>Can’t delete — these records have a <em>required</em> lookup to it:</p>
          <ul>
            {plan.blocked.map((b) => (
              <li key={b.record.id + b.field.apiName}>
                {label(b.record.id)} — {b.field.label}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {others.length > 0 && (
            <>
              <p>Also deleted (master-detail children / standard link):</p>
              <ul>
                {others.map((id) => (
                  <li key={id}>{label(id)}</li>
                ))}
              </ul>
            </>
          )}
          {plan.clear.length > 0 && (
            <p>Optional lookups cleared on: {plan.clear.map((c) => `${displayName(c.record)} (${c.field.label})`).join(', ')}.</p>
          )}
        </>
      )}
      {errors.map((e) => (
        <p key={e} className="vm-form-error">
          {e}
        </p>
      ))}
      <div className="vm-form-actions">
        {plan.blocked.length === 0 && (
          <button
            type="button"
            className="vm-button vm-button-danger"
            onClick={() => {
              const result = remove(recordId)
              if (result.ok) onDeleted?.(result)
              else setErrors(result.errors)
            }}
          >
            Delete {others.length ? `${others.length + 1} records` : ''}
          </button>
        )}
        <button type="button" className="vm-button" onClick={() => setPlan(null)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
