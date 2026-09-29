import { Link } from 'react-router-dom'
import { vmRecordPath } from '../../data/navigation'
import { getObject, labelFor } from '../../data/npc-vm'
import { displayName, recordGraph } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

function RecordNode({ record }) {
  return (
    <Link to={vmRecordPath(record.objectApiName, record.id)} className="vm-graph-node">
      <span className="vm-graph-name">{displayName(record)}</span>
      <span className="vm-graph-object">{getObject(record.objectApiName).label}</span>
    </Link>
  )
}

function Children({ node }) {
  if (!node.children.length) return null
  const groups = new Map()
  for (const child of node.children) {
    const key = child.via.label
    groups.set(key, [...(groups.get(key) ?? []), child])
  }
  return (
    <ul className="vm-graph-children">
      {[...groups].map(([label, items]) => (
        <li key={label}>
          <span className="vm-graph-group">{label.replace(/ records$/, '')} ({items.length})</span>
          <ul>
            {items.map((child) => (
              <li key={child.record.id}>
                <RecordNode record={child.record} />
                <Children node={child.node} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

// Record relationship explorer — generated from actual relationships and records.
export default function RecordGraph({ record, depth = 2 }) {
  const { records } = useVmStore()
  const graph = recordGraph(records, record, depth)
  return (
    <div className="vm-graph">
      {graph.parents.length > 0 && (
        <div className="vm-graph-parents">
          <span className="vm-graph-group">Looks up to</span>
          <ul>
            {graph.parents.map((p) => (
              <li key={p.via.apiName + p.record.id}>
                <span className="vm-graph-via">{p.via.label} →</span> <RecordNode record={p.record} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="vm-graph-root">
        <RecordNode record={record} />
      </div>
      <Children node={graph} />
      {!graph.children.length && <p className="vm-graph-empty">No related {labelFor(record.objectApiName)} records yet.</p>}
    </div>
  )
}
