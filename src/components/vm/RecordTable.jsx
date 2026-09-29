import { Link } from 'react-router-dom'
import { vmEditRecordPath, vmRecordPath } from '../../data/navigation'
import { getObject } from '../../data/npc-vm'
import { displayName } from '../../lib/vm/records'
import DeleteButton from './DeleteButton'
import FieldValue from './FieldValue'

// Generic list view for any object: name, the object's list fields, and its first
// relationship fields. Nothing here is object-specific.
export default function RecordTable({ objectApiName, records, actions = true, maxLookups = 2, empty, excludeFields = [] }) {
  const object = getObject(objectApiName)
  const byName = new Map(object.fields.map((f) => [f.apiName, f]))
  const nameFields = new Set([object.nameField].flat())
  const listFields = object.listFields.map((n) => byName.get(n)).filter((f) => f && !nameFields.has(f.apiName))
  const lookups = object.fields
    .filter((f) => f.targets && f.type !== 'StandardLink' && !excludeFields.includes(f.apiName))
    .sort((a, b) => Number(b.required) - Number(a.required))
    .slice(0, maxLookups)
  const columns = [...lookups, ...listFields]

  if (!records.length) return <p className="vm-empty">{empty ?? `No ${object.label} records yet.`}</p>

  return (
    <div className="table-wrap vm-record-table">
      <table>
        <thead>
          <tr>
            <th>{object.label}</th>
            {columns.map((f) => (
              <th key={f.apiName}>{f.label}</th>
            ))}
            {actions && <th className="vm-actions-col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <Link to={vmRecordPath(objectApiName, record.id)} className="vm-record-name">
                  {displayName(record)}
                </Link>
                <span className="vm-record-meta">
                  <code>{record.id}</code>
                  {record.origin === 'user' && <span className="vm-origin-user">yours</span>}
                </span>
              </td>
              {columns.map((f) => (
                <td key={f.apiName}>
                  <FieldValue field={f} record={record} />
                </td>
              ))}
              {actions && (
                <td className="vm-actions-col">
                  <span className="vm-row-actions">
                    <Link to={vmRecordPath(objectApiName, record.id)}>Open</Link>
                    <Link to={vmEditRecordPath(objectApiName, record.id)}>Edit</Link>
                    <DeleteButton recordId={record.id} compact />
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
