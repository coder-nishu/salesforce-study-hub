import { Fragment, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AreaOverview from '../../components/vm/AreaOverview'
import Breadcrumbs from '../../components/Breadcrumbs'
import FocusMap from '../../components/vm/FocusMap'
import LookupField from '../../components/vm/LookupField'
import RecordGraph from '../../components/vm/RecordGraph'
import { RelTypeBadge, VerifyMarker } from '../../components/vm/VmBadges'
import { vmModelPath, vmModelViewPath, vmObjectPath, vmPath, vmRecordPath } from '../../data/navigation'
import { areas, areasById, getObject, labelFor, objectForId, objectsByArea, relationshipFieldApiName, relationships } from '../../data/npc-vm'
import { staffingChain } from '../../data/npc-vm/processes'
import { displayName, getRecord, parentRefs, relatedLists } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

const DEFAULT_FOCUS = 'JobPosition'
const VIEWS = [
  { id: 'focus', label: 'Focus view' },
  { id: 'area', label: 'Area view' },
  { id: 'full', label: 'Full model' },
  { id: 'record', label: 'Record view' },
]

function Legend() {
  return (
    <ul className="vm-legend" aria-label="Legend">
      <li><span className="vm-legend-line is-md" /> Master-detail</li>
      <li><span className="vm-legend-line is-lk" /> Lookup</li>
      <li><span className="vm-legend-line is-verify" /> Verify against source</li>
      <li><span className="vm-legend-or">OR</span> One-of constraint</li>
    </ul>
  )
}

function FocusSelect({ focus, view }) {
  const navigate = useNavigate()
  return (
    <label className="vm-select">
      <span>Focus object</span>
      <select
        value={focus}
        onChange={(e) => navigate(view === 'area' ? vmModelViewPath('area', { focus: e.target.value }) : vmModelPath(e.target.value))}
      >
        {areas.map((a) => (
          <optgroup key={a.id} label={a.label}>
            {objectsByArea.get(a.id).map((o) => (
              <option key={o.apiName} value={o.apiName}>{o.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function StaffingChain() {
  const byId = new Map(relationships.map((r) => [r.id, r]))
  const nodes = []
  let current = null
  for (const id of staffingChain) {
    const r = byId.get(id)
    if (!r) continue
    // Walk from the current node to the other end of the relationship.
    const from = current ?? r.parent
    const to = from === r.child ? r.parent : r.child
    if (!current) nodes.push({ object: from })
    nodes.push({ object: to, relationship: r, direction: from === r.child ? 'up' : 'down' })
    current = to
  }
  return (
    <ol className="vm-chain">
      {nodes.map((n, i) => (
        <Fragment key={i}>
          {n.relationship && (
            <li className="vm-chain-edge" aria-hidden="true">
              <RelTypeBadge type={n.relationship.type} />
              <span>{n.direction === 'up' ? '→' : '←'} {relationshipFieldApiName(n.relationship)}</span>
            </li>
          )}
          <li className="vm-chain-node">
            <Link to={vmObjectPath(n.object)}>{labelFor(n.object)}</Link>
          </li>
        </Fragment>
      ))}
    </ol>
  )
}

function FullModel() {
  const [areaFilter, setAreaFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const list = relationships.filter(
    (r) =>
      (areaFilter === 'all' || getObject(r.child).area === areaFilter || getObject(r.parent).area === areaFilter) &&
      (typeFilter === 'all' || r.type === typeFilter),
  )
  return (
    <>
      <section className="vm-section">
        <h2 className="section-label">The staffing chain</h2>
        <p className="vm-section-hint">
          From a person’s skill to their assignment — each arrow is a real relationship in the schema (child field → parent).
        </p>
        <StaffingChain />
      </section>
      <section className="vm-section">
        <h2 className="section-label">
          All relationships <span className="section-count">{list.length}</span>
        </h2>
        <div className="vm-filters">
          <label className="vm-select">
            <span>Area</span>
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
              <option value="all">All areas</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <label className="vm-select">
            <span>Type</span>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              <option value="MasterDetail">Master-detail</option>
              <option value="Lookup">Lookup</option>
              <option value="StandardLink">Standard link</option>
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Child</th><th>Field</th><th>Type</th><th>Parent</th><th>Areas</th></tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const childArea = getObject(r.child).area
                const parentArea = getObject(r.parent).area
                return (
                  <tr key={r.id}>
                    <td><Link to={vmModelPath(r.child)}>{labelFor(r.child)}</Link></td>
                    <td><code>{relationshipFieldApiName(r)}</code>{r.constraint && <span className="vm-badge vm-badge-oneof">one-of</span>}</td>
                    <td><RelTypeBadge type={r.type} /> <VerifyMarker relationship={r} /></td>
                    <td><Link to={vmModelPath(r.parent)}>{labelFor(r.parent)}</Link></td>
                    <td>{childArea === parentArea ? areasById.get(childArea).label : <strong>{areasById.get(childArea).label} → {areasById.get(parentArea).label}</strong>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

// Schema path next to data path, through each related record: R ← child → other parent.
function RecordView({ recordId }) {
  const { records } = useVmStore()
  const navigate = useNavigate()
  const record = getRecord(records, recordId)
  const [objectApiName, setObjectApiName] = useState(() => objectForId(recordId) ?? 'Account')
  const paths = []
  if (record) {
    for (const list of relatedLists(records, record)) {
      for (const child of list.items) {
        const others = parentRefs(records, child).filter(({ ref }) => ref?.record && ref.id !== record.id)
        if (list.relationship.type === 'StandardLink' || !others.length) {
          paths.push({ child, list, other: null })
          continue
        }
        for (const { field, ref } of others) paths.push({ child, list, other: ref.record, field })
      }
    }
  }
  return (
    <>
      <div className="vm-filters">
        <label className="vm-select">
          <span>Object</span>
          <select value={objectApiName} onChange={(e) => setObjectApiName(e.target.value)}>
            {areas.map((a) => (
              <optgroup key={a.id} label={a.label}>
                {objectsByArea.get(a.id).map((o) => <option key={o.apiName} value={o.apiName}>{o.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="vm-select vm-record-picker">
          <span>Record</span>
          <LookupField
            key={objectApiName}
            targetObject={objectApiName}
            value={objectForId(recordId) === objectApiName ? recordId : ''}
            onChange={(id) => navigate(vmModelViewPath('record', id ? { record: id } : {}))}
          />
        </div>
      </div>
      {!record ? (
        <p className="vm-empty">Pick a record (e.g. Sarah Ahmed) to compare the schema with the actual records.</p>
      ) : (
        <>
          <section className="vm-section">
            <h2 className="section-label">Schema vs data</h2>
            <div className="table-wrap">
              <table className="vm-paths">
                <thead><tr><th>Schema (objects)</th><th>Data (records)</th></tr></thead>
                <tbody>
                  {paths.map(({ child, other, field, list }, i) => (
                    <tr key={i}>
                      <td>
                        {labelFor(record.objectApiName)} {list.relationship.type === 'StandardLink' ? '⇄' : '←'} <strong>{labelFor(child.objectApiName)}</strong>
                        {list.relationship.type === 'StandardLink' && <span className="vm-field-sub">standard link</span>}
                        {other && <> → {labelFor(other.objectApiName)} <span className="vm-field-sub">via {field.apiName}</span></>}
                      </td>
                      <td>
                        {displayName(record)} {list.relationship.type === 'StandardLink' ? '⇄' : '←'} <Link to={vmRecordPath(child.objectApiName, child.id)}>{displayName(child)}</Link>
                        {other && <> → <Link to={vmRecordPath(other.objectApiName, other.id)}>{displayName(other)}</Link></>}
                      </td>
                    </tr>
                  ))}
                  {paths.length === 0 && <tr><td colSpan={2}>No related records.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
          <section className="vm-section">
            <h2 className="section-label">Record relationship explorer</h2>
            <RecordGraph record={record} depth={2} />
          </section>
        </>
      )}
    </>
  )
}

export default function VmModel() {
  const [params] = useSearchParams()
  const requested = params.get('focus')
  const view = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'focus'
  const focus = getObject(requested) ? requested : DEFAULT_FOCUS
  const object = getObject(focus)

  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'Volunteer Management Lab', to: vmPath }, { label: 'Data Model' }]} />
      <header className="page-header">
        <h1 className="page-title">Data Model</h1>
        <p className="page-subtitle">Objects and relationships from your ERD — as a focus map, by area, in full, or through real records.</p>
      </header>

      <nav className="vm-object-tabs" aria-label="Data model views">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            to={v.id === 'focus' ? vmModelPath(focus) : vmModelViewPath(v.id, v.id === 'area' ? { focus } : {})}
            className={`vm-object-tab${view === v.id ? ' is-active' : ''}`}
            aria-current={view === v.id ? 'page' : undefined}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {requested && !getObject(requested) && (
        <p className="vm-todo-banner">Unknown object “{requested}” — showing {object.label} instead.</p>
      )}

      {(view === 'focus' || view === 'area') && (
        <div className="vm-map-toolbar">
          <FocusSelect focus={focus} view={view} />
          <Legend />
        </div>
      )}

      {view === 'focus' && (
        <>
          <section className="vm-section">
            <h2 className="section-label">Focus view</h2>
            <FocusMap apiName={focus} />
          </section>
          <section className="vm-section">
            <h2 className="section-label">Area overview</h2>
            <AreaOverview selected={focus} />
          </section>
        </>
      )}
      {view === 'area' && (
        <section className="vm-section">
          <AreaOverview selected={focus} hrefFor={(api) => vmModelViewPath('area', { focus: api })} />
        </section>
      )}
      {view === 'full' && <FullModel />}
      {view === 'record' && <RecordView recordId={params.get('record')} />}
    </div>
  )
}
