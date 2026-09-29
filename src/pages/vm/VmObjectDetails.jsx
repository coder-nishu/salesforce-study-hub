import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { ApiNameBadge, AreaTag, ObjectKindBadge, RelTypeBadge, VerifyMarker } from '../../components/vm/VmBadges'
import { vmModelPath, vmObjectPath, vmObjectsPath, vmPath } from '../../data/navigation'
import { describeFromChild, describeFromParent, getObject, labelFor, withArticle } from '../../data/npc-vm'
import NotFound from '../NotFound'

const SOURCE_LABELS = { erd: 'ERD', 'assumed-standard': 'Assumed standard' }

function requiredLabel(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
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
        <VerifyMarker relationship={relationship} />
      </div>
      <p className="vm-rel-row-text">{description}</p>
      {relationship.note && <p className="vm-rel-row-note">{relationship.note}</p>}
    </li>
  )
}

export default function VmObjectDetails() {
  const { apiName } = useParams()
  const object = getObject(apiName)
  if (!object) return <NotFound />

  const parents = object.parents.filter((r) => r.parent !== object.apiName)
  const oneOfRelIds = new Set(object.constraints.flatMap((c) => c.relationships.map((r) => r.id)))

  return (
    <div className="page vm-details">
      <Breadcrumbs
        items={[
          { label: 'Volunteer Management Lab', to: vmPath },
          { label: 'Object Explorer', to: vmObjectsPath },
          { label: object.label },
        ]}
      />

      <header className="page-header">
        <div className="vm-details-area">
          <AreaTag areaId={object.area} />
        </div>
        <h1 className="page-title">{object.label}</h1>
        <div className="vm-details-meta">
          <code>{object.apiName}</code>
          <ObjectKindBadge object={object} />
          <ApiNameBadge status={object.apiNameStatus} />
        </div>
        {object.description ? (
          <p className="page-subtitle">{object.description}</p>
        ) : (
          <p className="vm-placeholder">Description — source definition required.</p>
        )}
        <Link to={vmModelPath(object.apiName)} className="button vm-details-map">
          View in Relationship Map →
        </Link>
      </header>

      {(object.notes.length > 0 || object.accountTypes || object.standardLinks.length > 0 || object.constraints.length > 0) && (
        <section className="vm-section">
          <h2 className="section-label">Notes</h2>
          <div className="vm-notes">
            {object.accountTypes && (
              <div className="vm-note">
                <strong>Account types</strong>
                <ul className="vm-account-types">
                  {object.accountTypes.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {object.notes.map((note) => (
              <p key={note} className="vm-note">{note}</p>
            ))}
            {object.standardLinks.map((l) => (
              <p key={l.id} className="vm-note">
                <strong>Standard link:</strong> {describeFromChild(l)}{' '}
                <Link to={vmObjectPath(l.other)}>{labelFor(l.other)} →</Link>
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
                — one of them, not both.
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="vm-section">
        <h2 className="section-label">
          Fields <span className="section-count">{object.fields.length}</span>
        </h2>
        {object.fieldsStatus === 'todo' && (
          <div className="vm-todo-banner">
            <strong>TODO — field list not yet supplied.</strong> Only <em>Name</em> (assumed standard) and the
            relationship fields derived from the ERD are shown.
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>API name</th>
                <th>Type</th>
                <th>Required?</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {object.fields.map((f) => (
                <tr key={f.apiName}>
                  <td>
                    {f.label}
                    {oneOfRelIds.has(f.relationshipId) && <span className="vm-badge vm-badge-oneof">one-of</span>}
                  </td>
                  <td>
                    <code>{f.apiName}</code>
                    {f.apiNameStatus === 'provisional' && <span className="vm-provisional-mark" title="Provisional API name">*</span>}
                  </td>
                  <td>
                    {f.referenceTo ? (
                      <>
                        {f.typeLabel.split('(')[0]}(<Link to={vmObjectPath(f.referenceTo)}>{labelFor(f.referenceTo)}</Link>)
                      </>
                    ) : (
                      f.type
                    )}
                  </td>
                  <td>{requiredLabel(f.required)}</td>
                  <td>
                    {SOURCE_LABELS[f.source] ?? f.source}
                    {f.confidence === 'verify' && <span className="vm-verify">verify</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vm-footnote">
          * Provisional API name. “Required?” for relationship fields is read from the ERD cardinality.
        </p>
      </section>

      <section className="vm-section">
        <h2 className="section-label">
          Looks up to <span className="section-count">{object.parents.length}</span>
        </h2>
        {object.parents.length === 0 ? (
          <p className="vm-empty">This object doesn’t look up to any other object on the ERD.</p>
        ) : (
          <ul className="vm-rel-list">
            {parents.map((r) => (
              <RelationshipRow
                key={r.id}
                relationship={r}
                target={r.parent}
                description={describeFromChild(r)}
                extra={r.constraint && <span className="vm-badge vm-badge-oneof">one-of</span>}
              />
            ))}
            {object.selfReferences.map((r) => (
              <RelationshipRow
                key={r.id}
                relationship={r}
                target={r.parent}
                description={describeFromChild(r)}
                extra={<span className="vm-badge vm-badge-self">self</span>}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="vm-section">
        <h2 className="section-label">
          Referenced by <span className="section-count">{object.children.length}</span>
        </h2>
        <p className="vm-section-hint">Future related lists on {withArticle(object.label)} record.</p>
        {object.children.length === 0 ? (
          <p className="vm-empty">No other object looks up to this one on the ERD.</p>
        ) : (
          <ul className="vm-rel-list">
            {object.children.map((r) => (
              <RelationshipRow
                key={r.id}
                relationship={r}
                target={r.child}
                description={describeFromParent(r)}
                extra={r.constraint && <span className="vm-badge vm-badge-oneof">one-of</span>}
              />
            ))}
          </ul>
        )}
        {object.selfReferences.length > 0 && (
          <p className="vm-footnote">
            {withArticle(object.label, true)} can also be referenced by other {object.label} records (self-reference, listed under
            “Looks up to”).
          </p>
        )}
      </section>
    </div>
  )
}
