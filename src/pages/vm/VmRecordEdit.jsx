import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import RecordForm from '../../components/vm/RecordForm'
import { vmObjectPath, vmPath, vmRecordPath, vmRecordsPath } from '../../data/navigation'
import { getObject } from '../../data/npc-vm'
import { displayName, getRecord } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import NotFound from '../NotFound'

// Query-string prefill values arrive as strings; convert them to the field's value type.
function prefillFrom(object, params) {
  const values = {}
  for (const field of object.fields) {
    const raw = params.get(field.apiName)
    if (raw === null) continue
    if (['Number', 'Currency', 'Percent'].includes(field.type)) values[field.apiName] = Number(raw)
    else if (field.type === 'Checkbox') values[field.apiName] = raw === 'true'
    else values[field.apiName] = raw
  }
  return values
}

export default function VmRecordEdit() {
  const { apiName, recordId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { records, create, update } = useVmStore()
  const object = getObject(apiName)
  const record = recordId ? getRecord(records, recordId) : null
  if (!object || (recordId && (!record || record.objectApiName !== apiName))) return <NotFound />

  const isNew = !record
  const returnTo = params.get('returnTo')

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Volunteer Management Lab', to: vmPath },
          { label: object.label, to: vmObjectPath(apiName) },
          { label: 'Records', to: vmRecordsPath(apiName) },
          isNew ? { label: 'New' } : { label: displayName(record), to: vmRecordPath(apiName, record.id) },
          ...(isNew ? [] : [{ label: 'Edit' }]),
        ]}
      />
      <header className="page-header">
        <div className="page-eyebrow">{object.label}</div>
        <h1 className="page-title">{isNew ? `New ${object.label}` : `Edit ${displayName(record)}`}</h1>
      </header>
      <RecordForm
        key={recordId ?? 'new'}
        objectApiName={apiName}
        isNew={isNew}
        initialValues={isNew ? prefillFrom(object, params) : record.values}
        submitLabel={isNew ? `Create ${object.label}` : 'Save changes'}
        onCancel={() => navigate(-1)}
        onSubmit={(values) => {
          const result = isNew ? create(apiName, values) : update(record.id, values)
          if (result.ok) navigate(returnTo ?? vmRecordPath(apiName, result.id))
          return result
        }}
      />
    </div>
  )
}
