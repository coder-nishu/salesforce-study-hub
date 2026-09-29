import { Link, useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import CapacityMeter from '../../components/vm/CapacityMeter'
import DeleteButton from '../../components/vm/DeleteButton'
import FieldValue from '../../components/vm/FieldValue'
import RecordGraph from '../../components/vm/RecordGraph'
import RelatedLists from '../../components/vm/RelatedLists'
import SourceBadge from '../../components/vm/SourceBadge'
import { RelTypeBadge } from '../../components/vm/VmBadges'
import WhyPanel from '../../components/vm/WhyPanel'
import {
  vmEditRecordPath,
  vmFindVolunteersPath,
  vmModelViewPath,
  vmObjectPath,
  vmPath,
  vmRecordsPath,
  vmUseCasePath,
} from '../../data/navigation'
import { getObject } from '../../data/npc-vm'
import { objectWhy } from '../../data/npc-vm/learning'
import { scenariosForObject } from '../../data/npc-vm/useCases'
import { shiftCapacity } from '../../lib/vm/capacity'
import { displayName, getRecord } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import NotFound from '../NotFound'

export default function VmRecordDetail() {
  const { apiName, recordId } = useParams()
  const navigate = useNavigate()
  const { records } = useVmStore()
  const object = getObject(apiName)
  const record = getRecord(records, recordId)
  if (!object || !record || record.objectApiName !== apiName) return <NotFound />

  const why = objectWhy(apiName)
  const detailFields = object.fields.filter((f) => !f.targets)
  const relationshipFields = object.fields.filter((f) => f.targets)
  const scenarios = scenariosForObject(apiName)
  const isShift = apiName === 'JobPositionShift'
  const isJob = apiName === 'JobPosition'

  return (
    <div className="page page-wide">
      <Breadcrumbs
        items={[
          { label: 'NPC Volunteer Management Lab', to: vmPath },
          { label: object.label, to: vmObjectPath(apiName) },
          { label: 'Records', to: vmRecordsPath(apiName) },
          { label: displayName(record) },
        ]}
      />

      <header className="vm-record-header">
        <div>
          <div className="page-eyebrow">{object.label}</div>
          <h1 className="page-title">{displayName(record)}</h1>
          <div className="vm-details-meta">
            <code>{record.id}</code>
            <span className={record.origin === 'demo' ? 'vm-origin-demo' : 'vm-origin-user'}>{record.origin === 'demo' ? 'Demo data' : 'Your record'}</span>
          </div>
        </div>
        <div className="vm-record-actions">
          <Link className="vm-button" to={vmEditRecordPath(apiName, record.id)}>Edit</Link>
          <DeleteButton recordId={record.id} onDeleted={() => navigate(vmRecordsPath(apiName))} />
          <Link className="vm-button" to={vmModelViewPath('record', { record: record.id })}>
            View in Data Model
          </Link>
        </div>
      </header>

      {record.learningNote && (
        <p className="vm-learning-note">
          <strong>What this record teaches:</strong> {record.learningNote}
        </p>
      )}

      {(isShift || isJob) && (
        <section className="vm-section">
          {isShift && (
            <>
              <h2 className="section-label">Shift capacity</h2>
              <CapacityMeter {...shiftCapacity(records, record)} />
            </>
          )}
          <Link className="vm-button vm-button-primary" to={`${vmFindVolunteersPath}?${isShift ? `shift=${record.id}` : `job=${record.id}`}`}>
            Find volunteers for this {isShift ? 'shift' : 'job position'} →
          </Link>
        </section>
      )}

      <div className="vm-record-layout">
        <div>
          <section className="vm-section">
            <h2 className="section-label">Details</h2>
            <dl className="vm-detail-grid">
              {detailFields.map((f) => (
                <div key={f.apiName}>
                  <dt>{f.label}</dt>
                  <dd><FieldValue field={f} record={record} /></dd>
                </div>
              ))}
            </dl>
            {relationshipFields.length > 0 && (
              <>
                <h3 className="vm-subhead">Looks up to</h3>
                <dl className="vm-detail-grid">
                  {relationshipFields.map((f) => (
                    <div key={f.apiName}>
                      <dt>
                        {f.label} <RelTypeBadge type={f.type} />
                      </dt>
                      <dd><FieldValue field={f} record={record} /></dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </section>

          <section className="vm-section">
            <h2 className="section-label">Related</h2>
            <RelatedLists record={record} />
          </section>
        </div>

        <aside className="vm-record-aside">
          {why && <WhyPanel title={`Why a ${object.label}?`} question={why.question} items={why.why} />}
          <section className="vm-section">
            <h2 className="section-label">Record relationships</h2>
            <RecordGraph record={record} depth={1} />
          </section>
          {scenarios.length > 0 && (
            <section className="vm-section">
              <h2 className="section-label">Use cases involving this record</h2>
              <ul className="vm-link-list">
                {scenarios.map((u) => (
                  <li key={u.id}>
                    <Link to={vmUseCasePath(u.id)}>{u.number}. {u.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="vm-form-hint">
            <SourceBadge source="learning" /> Relationship values are stored as IDs — names are looked up when shown.
          </p>
        </aside>
      </div>
    </div>
  )
}
