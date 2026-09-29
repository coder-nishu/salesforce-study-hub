import { Link } from 'react-router-dom'
import { vmNewRecordPath, vmObjectPath } from '../../data/navigation'
import { describeFromParent, labelFor } from '../../data/npc-vm'
import { relatedLists } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'
import RecordTable from './RecordTable'
import { RelTypeBadge } from './VmBadges'

// Related lists are derived from relationships: child records whose lookup holds this record's ID.
export default function RelatedLists({ record }) {
  const { records } = useVmStore()
  const lists = relatedLists(records, record)
  if (!lists.length) return <p className="vm-empty">Nothing on the model looks up to this object.</p>
  // Lists with records first; empty ones collapse into a compact row of "New" links.
  const filled = lists.filter((l) => l.items.length)
  const empty = lists.filter((l) => !l.items.length && l.relationship.type !== 'StandardLink')

  return (
    <div className="vm-related">
      {filled.map((list) => {
        const r = list.relationship
        const isLink = r.type === 'StandardLink'
        return (
          <section key={r.id + list.fieldApiName + list.childObjectApiName} className="vm-related-list">
            <header className="vm-related-head">
              <h3>
                <Link to={vmObjectPath(list.childObjectApiName)}>{isLink ? list.label : `${labelFor(r.child)}`}</Link>
                <span className="section-count">{list.items.length}</span>
              </h3>
              <RelTypeBadge type={r.type} />
              {!isLink && <span className="vm-related-via">via {list.fieldApiName}</span>}
              {!isLink && (
                <Link className="vm-button is-compact" to={vmNewRecordPath(r.child, { [list.fieldApiName]: record.id })}>
                  New
                </Link>
              )}
            </header>
            {!isLink && <p className="vm-related-desc">{describeFromParent(r)}</p>}
            {list.items.length > 0 ? (
              <RecordTable objectApiName={list.childObjectApiName} records={list.items} actions={false} maxLookups={1} excludeFields={[list.fieldApiName]} />
            ) : (
              <p className="vm-related-empty">None yet.</p>
            )}
          </section>
        )
      })}
      {empty.length > 0 && (
        <div className="vm-related-empty-row">
          <span>No records yet:</span>
          {empty.map((list) => (
            <Link key={list.relationship.id} to={vmNewRecordPath(list.relationship.child, { [list.fieldApiName]: record.id })} title={describeFromParent(list.relationship)}>
              + {labelFor(list.relationship.child)}
              {list.relationship.child === list.relationship.parent ? ' (child)' : ''}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
