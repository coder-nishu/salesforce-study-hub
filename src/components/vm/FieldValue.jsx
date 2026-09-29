import { Link } from 'react-router-dom'
import { vmRecordPath } from '../../data/navigation'
import { objectForId } from '../../data/npc-vm'
import { computeField } from '../../lib/vm/capacity'
import { displayName, getRecord } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import { isEmpty } from '../../lib/vm/validation'

export function RecordLink({ id, children }) {
  const { records } = useVmStore()
  const record = getRecord(records, id)
  if (!record) return <span className="vm-missing">{id} (not found)</span>
  return <Link to={vmRecordPath(record.objectApiName, id)}>{children ?? displayName(record)}</Link>
}

// Displays one field value according to its type. Lookups show the related record's name.
export default function FieldValue({ field, record }) {
  const { records } = useVmStore()
  const value = field.type === 'Computed' ? computeField(field.compute, record, records) : record.values[field.apiName]
  if (isEmpty(value)) return <span className="vm-empty-value">—</span>

  switch (field.type) {
    case 'Lookup':
    case 'MasterDetail':
    case 'StandardLink':
      return (
        <span className="vm-lookup-value">
          <RecordLink id={value} />
          {field.polymorphic && <span className="vm-lookup-kind">{objectForId(value)}</span>}
        </span>
      )
    case 'Checkbox':
      return value ? <span className="vm-check">✓ Yes</span> : <span className="vm-empty-value">No</span>
    case 'Currency':
      return <span>{Number(value).toLocaleString()}</span>
    case 'Percent':
      return <span>{value}%</span>
    case 'Email':
      return <a href={`mailto:${value}`}>{value}</a>
    case 'URL':
      return <a href={value} target="_blank" rel="noreferrer">{value}</a>
    case 'LongText':
      return <span className="vm-longtext">{value}</span>
    case 'DateTime':
      return <span>{String(value).replace('T', ' ')}</span>
    default:
      return <span>{String(value)}</span>
  }
}
