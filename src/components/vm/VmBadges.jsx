import { TYPE_LABELS, TYPE_SHORT, areasById } from '../../data/npc-vm'

export function ObjectKindBadge({ object }) {
  return object.isStandard ? (
    <span className="vm-badge vm-badge-standard" title="Salesforce standard object">Standard</span>
  ) : (
    <span className="vm-badge vm-badge-license" title="Other object included in this license">License object</span>
  )
}

export function ApiNameBadge({ status }) {
  if (status === 'provisional') {
    return (
      <span className="vm-badge vm-badge-provisional" title="API name derived from the label — not verified">
        Provisional API name
      </span>
    )
  }
  return null
}

export function RelTypeBadge({ type }) {
  return (
    <span className={`vm-badge vm-rel-${type}`} title={TYPE_LABELS[type]}>
      {TYPE_SHORT[type]}
    </span>
  )
}

export function VerifyMarker({ relationship }) {
  if (relationship.confidence !== 'verify') return null
  return (
    <span className="vm-verify" title={relationship.note ?? 'Verify this relationship against the source ERD'}>
      verify against source
    </span>
  )
}

export function AreaTag({ areaId }) {
  const area = areasById.get(areaId)
  return <span className={`vm-area-tag vm-area-${area.colorToken}`}>{area.label}</span>
}
