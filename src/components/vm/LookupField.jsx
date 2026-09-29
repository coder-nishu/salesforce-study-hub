import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { vmNewRecordPath, vmRecordPath } from '../../data/navigation'
import { getObject } from '../../data/npc-vm'
import { displayName, getRecord, recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

// Salesforce-like lookup: search the target object's records, store the selected ID,
// show the record's name. Reused for every Lookup / Master-Detail field.
export default function LookupField({ id, targetObject, value, onChange, invalid, filter }) {
  const { records } = useVmStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const listId = useId()
  const target = getObject(targetObject)
  const selected = getRecord(records, value)

  if (selected) {
    return (
      <div className="vm-lookup-selected">
        <Link to={vmRecordPath(selected.objectApiName, selected.id)} target="_blank" rel="noreferrer">
          {displayName(selected)}
        </Link>
        <code>{selected.id}</code>
        <button type="button" className="vm-link-button" onClick={() => onChange('')} aria-label={`Clear ${target.label}`}>
          ✕ Clear
        </button>
      </div>
    )
  }

  const needle = query.trim().toLowerCase()
  const options = recordsOf(records, targetObject)
    .filter((r) => (filter ? filter(r) : true))
    .filter((r) => !needle || displayName(r).toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle))
    .slice(0, 8)

  return (
    <div className="vm-lookup">
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        placeholder={`Search ${target.label}…`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <ul id={listId} role="listbox" className="vm-lookup-options">
          {options.map((r) => (
            <li key={r.id} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(r.id)
                  setQuery('')
                  setOpen(false)
                }}
              >
                <span>{displayName(r)}</span>
                <code>{r.id}</code>
              </button>
            </li>
          ))}
          {options.length === 0 && <li className="vm-lookup-none">No {target.label} records match.</li>}
          <li className="vm-lookup-new">
            <Link to={vmNewRecordPath(targetObject)} target="_blank" rel="noreferrer">
              + New {target.label} (opens a new tab)
            </Link>
          </li>
        </ul>
      )}
    </div>
  )
}
