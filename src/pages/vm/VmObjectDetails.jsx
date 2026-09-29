import { Link, useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import RecordTable from '../../components/vm/RecordTable'
import SourceBadge from '../../components/vm/SourceBadge'
import { ApiNameBadge, AreaTag, ObjectKindBadge, RelTypeBadge, VerifyMarker } from '../../components/vm/VmBadges'
import WhyPanel from '../../components/vm/WhyPanel'
import {
  vmModelPath,
  vmNewRecordPath,
  vmObjectPath,
  vmObjectsPath,
  vmPath,
  vmRecordsPath,
  vmUseCasePath,
} from '../../data/navigation'
import { describeFromChild, describeFromParent, getObject, labelFor, withArticle } from '../../data/npc-vm'
import { fieldWhy, objectWhy } from '../../data/npc-vm/learning'
import { scenariosForObject } from '../../data/npc-vm/useCases'
import { recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import NotFound from '../NotFound'

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'fields', label: 'Fields' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'records', label: 'Records' },
  { id: 'use-cases', label: 'Use Cases' },
]

const REQUIRED_SOURCE = {
  'master-detail': 'Master-detail',
  official: 'Official',
  erd: 'ERD cardinality',
  'standard-link': 'Maintained automatically',
}

function RelationshipRow({ relationship, target, description, extra }) {
  return (
    <li className="vm-rel-row">
      <div className="vm-rel-row-head">
        <RelTypeBadge type={relationship.type} />
        <Link to={vmObjectPath(target)} className="vm-rel-row-target">
          {labelFor(target)}
        </Link>
        {extra}
        {relationship.confidence === 'official' && (
          <span className="vm-confirmed" title="Direction confirmed by the official Salesforce reference">confirmed</span>
        )}
        <VerifyMarker relationship={relationship} />
      </div>
      <p className="vm-rel-row-text">{description}</p>
      {relationship.note && <p className="vm-rel-row-note">{relationship.note}</p>}
      {relationship.officialNote && (
        <p className="vm-rel-row-official">
          <SourceBadge source="official" /> {relationship.officialNote}
        </p>
      )}
    </li>
  )
}

function DetailsTab({ object }) {
  const why = objectWhy(object.apiName)
  return (
    <>
      {why && <WhyPanel question={why.question} items={why.why} />}
      <section className="vm-section">
        <h2 className="section-label">Source status</h2>
        <ul className="vm-source-list">
          <li><SourceBadge source="erd" /> Object and relationships from your ERD.</li>
          <li>
            {object.fieldsStatus === 'sourced' ? (
              <>Fields: {object.sourceRef ? <a href={object.sourceRef} target="_blank" rel="noreferrer">official Salesforce reference</a> : 'standard / course fields'} — see the Fields tab for each field’s source.</>
            ) : (
              <>Fields: <strong>TODO — field list not yet supplied.</strong> Only Name and the ERD relationship fields are shown.</>
            )}
          </li>
          <li>API name: {object.isStandard ? 'Salesforce standard object' : 'from the Salesforce reference where available, otherwise provisional'}.</li>
        </ul>
      </section>

      {(object.notes.length > 0 || object.accountTypes || object.standardLinks.length > 0 || object.constraints.length > 0) && (
        <section className="vm-section">
          <h2 className="section-label">Notes</h2>
          <div className="vm-notes">
            {object.accountTypes && (
              <div className="vm-note">
                <strong>Account types</strong>
                <ul className="vm-account-types">
                  {object.accountTypes.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            )}
            {object.notes.map((note) => <p key={note} className="vm-note">{note}</p>)}
            {object.standardLinks.map((l) => (
              <p key={l.id} className="vm-note">
                <strong>Standard link:</strong> {describeFromChild(l)} <Link to={vmObjectPath(l.other)}>{labelFor(l.other)} →</Link>
              </p>
            ))}
            {object.constraints.map((c) => (
              <p key={c.group} className="vm-note vm-note-constraint">
                <strong>One-of constraint:</strong> {withArticle(object.label)} references{' '}
                {c.targets.map((t, i) => (
                  <span key={t}>
                    {i > 0 && <strong> OR </strong>}
                    {withArticle(labelFor(t)).split(' ')[0]} <Link to={vmObjectPath(t)}>{labelFor(t)}</Link>
                  </span>
                ))}{' '}
                — one of them, not both. Officially this is a single polymorphic field, <code>QualificationReferenceRecordId</code>.
              </p>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function FieldsTab({ object }) {
  return (
    <section className="vm-section">
      {object.fieldsStatus === 'todo' && (
        <div className="vm-todo-banner">
          <strong>TODO — field list not yet supplied.</strong> Only <em>Name</em> and the relationship fields from the ERD are shown.
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>API name</th>
              <th>Type</th>
              <th>Required</th>
              <th>Relationship</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {object.fields.map((f) => {
              const why = fieldWhy(object.apiName, f.apiName)
              return (
                <tr key={f.apiName}>
                  <td>
                    {f.label}
                    {f.polymorphic && <span className="vm-badge vm-badge-oneof">one-of</span>}
                    {(why || f.description) && (
                      <details className="vm-field-why">
                        <summary>Why is this field here?</summary>
                        {why && <p><SourceBadge source={why.source} /> {why.text}</p>}
                        {f.description && <p>{f.description}</p>}
                      </details>
                    )}
                  </td>
                  <td>
                    <code>{f.apiName}</code>
                    {f.apiNameStatus === 'provisional' && <span className="vm-provisional-mark" title="Provisional API name">*</span>}
                  </td>
                  <td>
                    {f.targets ? f.typeLabel.split('(')[0] : f.type}
                    {f.type === 'Picklist' && <span className="vm-field-options">{f.options.join(' · ')}</span>}
                  </td>
                  <td>
                    {f.required ? 'Yes' : 'No'}
                    {f.requiredSource && <span className="vm-field-sub">{REQUIRED_SOURCE[f.requiredSource]}</span>}
                    {f.requiredDiffers && <span className="vm-verify">differs from ERD</span>}
                  </td>
                  <td>
                    {f.targets
                      ? f.targets.map((t, i) => (
                          <span key={t}>
                            {i > 0 && ' | '}
                            <Link to={vmObjectPath(t)}>{labelFor(t)}</Link>
                          </span>
                        ))
                      : '—'}
                  </td>
                  <td>
                    <SourceBadge source={f.targets ? 'erd' : f.sourceStatus} />
                    {f.optionsSource && <span className="vm-field-sub">values: {f.optionsSource}</span>}
                    {f.confidence === 'verify' && <span className="vm-verify">verify</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="vm-footnote">
        * Provisional API name (derived from the label). Relationship fields are generated from the ERD relationships; “Required”
        uses the official reference where it exists, otherwise the ERD cardinality.
      </p>
    </section>
  )
}

function RelationshipsTab({ object }) {
  const parents = object.parents.filter((r) => r.parent !== object.apiName)
  return (
    <>
      <section className="vm-section">
        <h2 className="section-label">
          Looks up to <span className="section-count">{object.parents.length}</span>
        </h2>
        {object.parents.length === 0 ? (
          <p className="vm-empty">This object doesn’t look up to any other object on the ERD.</p>
        ) : (
          <ul className="vm-rel-list">
            {parents.map((r) => (
              <RelationshipRow key={r.id} relationship={r} target={r.parent} description={describeFromChild(r)} extra={r.constraint && <span className="vm-badge vm-badge-oneof">one-of</span>} />
            ))}
            {object.selfReferences.map((r) => (
              <RelationshipRow key={r.id} relationship={r} target={r.parent} description={describeFromChild(r)} extra={<span className="vm-badge vm-badge-self">self</span>} />
            ))}
          </ul>
        )}
      </section>
      <section className="vm-section">
        <h2 className="section-label">
          Referenced by <span className="section-count">{object.children.length}</span>
        </h2>
        <p className="vm-section-hint">These become related lists on {withArticle(object.label)} record.</p>
        {object.children.length === 0 ? (
          <p className="vm-empty">No other object looks up to this one on the ERD.</p>
        ) : (
          <ul className="vm-rel-list">
            {object.children.map((r) => (
              <RelationshipRow key={r.id} relationship={r} target={r.child} description={describeFromParent(r)} extra={r.constraint && <span className="vm-badge vm-badge-oneof">one-of</span>} />
            ))}
          </ul>
        )}
        {object.selfReferences.length > 0 && (
          <p className="vm-footnote">
            {withArticle(object.label, true)} can also be referenced by other {object.label} records (self-reference, listed under “Looks up to”).
          </p>
        )}
      </section>
    </>
  )
}

export default function VmObjectDetails() {
  const { apiName } = useParams()
  const [params, setParams] = useSearchParams()
  const { records } = useVmStore()
  const object = getObject(apiName)
  if (!object) return <NotFound />
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'details'
  const objectRecords = recordsOf(records, apiName)
  const scenarios = scenariosForObject(apiName)

  return (
    <div className="page page-wide vm-details">
      <Breadcrumbs items={[{ label: 'NPC Volunteer Management Lab', to: vmPath }, { label: 'Objects', to: vmObjectsPath }, { label: object.label }]} />

      <header className="page-header">
        <div className="vm-details-area"><AreaTag areaId={object.area} /></div>
        <h1 className="page-title">{object.label}</h1>
        <div className="vm-details-meta">
          <code>{object.apiName}</code>
          <ObjectKindBadge object={object} />
          <ApiNameBadge status={object.apiNameStatus} />
          <span className="vm-record-meta">
            {object.fields.length} fields · {object.parents.length + object.children.length} relationships · {objectRecords.length} records
          </span>
        </div>
        {object.description ? <p className="page-subtitle">{object.description}</p> : null}
        <div className="vm-form-actions">
          <Link to={vmRecordsPath(apiName)} className="vm-button">Records ({objectRecords.length})</Link>
          <Link to={vmNewRecordPath(apiName)} className="vm-button">New {object.label}</Link>
          <Link to={vmModelPath(apiName)} className="vm-button">View in Relationship Map →</Link>
        </div>
      </header>

      <div className="vm-object-tabs" role="tablist" aria-label={`${object.label} sections`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`vm-object-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setParams(t.id === 'details' ? {} : { tab: t.id }, { replace: true })}
          >
            {t.label}
            {t.id === 'records' && <span className="section-count">{objectRecords.length}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'details' && <DetailsTab object={object} />}
        {tab === 'fields' && <FieldsTab object={object} />}
        {tab === 'relationships' && <RelationshipsTab object={object} />}
        {tab === 'records' && (
          <section className="vm-section">
            <div className="vm-form-actions">
              <Link to={vmNewRecordPath(apiName)} className="vm-button vm-button-primary">New {object.label}</Link>
            </div>
            <RecordTable objectApiName={apiName} records={objectRecords} />
          </section>
        )}
        {tab === 'use-cases' && (
          <section className="vm-section">
            {scenarios.length === 0 ? (
              <p className="vm-empty">No scenario uses {object.label} yet — not every object takes part in a workflow.</p>
            ) : (
              <ul className="vm-link-list">
                {scenarios.map((u) => (
                  <li key={u.id}>
                    <Link to={vmUseCasePath(u.id)}>{u.number}. {u.title}</Link> — {u.learningObjective}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
