import { Link } from 'react-router-dom'
import { vmModelPath, vmObjectPath } from '../../data/navigation'
import { TYPE_LABELS, getObject, labelFor, withArticle } from '../../data/npc-vm'
import { RelTypeBadge } from './VmBadges'

// Focus view: the chosen object in the centre, parents on the left, children on the right,
// joined by plain SVG lines. Every node is a link that re-centres the map.
//
// Geometry is deterministic (fixed node height), so no DOM measuring is needed.
// The SVG uses a 1000-unit-wide viewBox stretched to the container; strokes stay crisp
// with vector-effect="non-scaling-stroke". On narrow screens CSS turns it into stacked lists.

const NODE_H = 60
const GAP = 12
const CENTER_H = 96
const COLUMNS = { left: [0, 300], center: [370, 630], right: [700, 1000] }

const typeRank = { MasterDetail: 0, Lookup: 1 }

function sortParents(rels) {
  // Master-detail first, then keep each oneOf group together, then alphabetical.
  return [...rels].sort(
    (a, b) =>
      typeRank[a.type] - typeRank[b.type] ||
      (a.constraint?.group ?? '').localeCompare(b.constraint?.group ?? '') ||
      labelFor(a.parent).localeCompare(labelFor(b.parent)),
  )
}

function sortChildren(rels) {
  return [...rels].sort(
    (a, b) => typeRank[a.type] - typeRank[b.type] || labelFor(a.child).localeCompare(labelFor(b.child)),
  )
}

function columnTops(count, height) {
  const used = count * NODE_H + Math.max(0, count - 1) * GAP
  const offset = (height - used) / 2
  return Array.from({ length: count }, (_, i) => offset + i * (NODE_H + GAP))
}

function edgePath(x1, y1, x2, y2) {
  const mid = (x1 + x2) / 2
  return `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`
}

function edgeClass(r) {
  return `fm-edge fm-edge-${r.type}${r.confidence === 'verify' ? ' is-verify' : ''}`
}

function Node({ apiName, relationship, side, top }) {
  const fieldLabel = relationship.fieldLabel ?? labelFor(relationship.parent)
  const detail = `via ${fieldLabel}`
  const oneOf = relationship.constraint?.type === 'oneOf'
  return (
    <Link
      to={vmModelPath(apiName)}
      className={`fm-node fm-node-${side}`}
      style={{ top }}
      title={`${TYPE_LABELS[relationship.type]} — focus on ${labelFor(apiName)}`}
    >
      <span className="fm-node-label">
        {labelFor(apiName)}
        {relationship.confidence === 'verify' && <span className="fm-node-verify" title="Verify against source">?</span>}
      </span>
      <span className="fm-node-detail">
        <RelTypeBadge type={relationship.type} />
        {oneOf && side === 'right' ? <span className="fm-oneof-tag">one-of</span> : null}
        <span className="fm-node-detail-text">{detail}</span>
      </span>
    </Link>
  )
}

export default function FocusMap({ apiName }) {
  const object = getObject(apiName)
  const parents = sortParents(object.parents.filter((r) => r.parent !== apiName))
  const children = sortChildren(object.children)
  const rows = Math.max(parents.length, children.length, 1)
  const height = Math.max(rows * NODE_H + (rows - 1) * GAP, CENTER_H + 40)
  const leftTops = columnTops(parents.length, height)
  const rightTops = columnTops(children.length, height)
  const centerY = height / 2

  // oneOf brackets: contiguous runs of parents that share a constraint group.
  const brackets = []
  parents.forEach((r, i) => {
    const group = r.constraint?.group
    if (!group) return
    const last = brackets[brackets.length - 1]
    if (last && last.group === group && last.end === i - 1) last.end = i
    else brackets.push({ group, start: i, end: i })
  })

  return (
    <div className="fm">
      <div className="fm-captions" aria-hidden="true">
        <span>Looks up to (parents)</span>
        <span>Focus</span>
        <span>Referenced by (children)</span>
      </div>

      <div className="fm-canvas" style={{ height }}>
        <svg
          className="fm-lines"
          viewBox={`0 0 1000 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {parents.map((r, i) => (
            <path
              key={r.id}
              className={edgeClass(r)}
              d={edgePath(COLUMNS.left[1], leftTops[i] + NODE_H / 2, COLUMNS.center[0], centerY)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {children.map((r, i) => (
            <path
              key={r.id}
              className={edgeClass(r)}
              d={edgePath(COLUMNS.center[1], centerY, COLUMNS.right[0], rightTops[i] + NODE_H / 2)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="fm-col fm-col-left">
          <div className="fm-col-caption">Looks up to (parents)</div>
          {parents.length === 0 && <p className="fm-empty">No parents</p>}
          {parents.map((r, i) => (
            <Node key={r.id} apiName={r.parent} relationship={r} side="left" top={leftTops[i]} />
          ))}
          {brackets.map((b) => (
            <div
              key={`${b.group}-${b.start}`}
              className="fm-bracket"
              style={{ top: leftTops[b.start] + 6, height: leftTops[b.end] - leftTops[b.start] + NODE_H - 12 }}
            >
              <span>OR</span>
            </div>
          ))}
        </div>

        <div className="fm-col fm-col-center">
          <div className="fm-col-caption">Focus</div>
          <div className="fm-center" style={{ top: centerY - CENTER_H / 2, minHeight: CENTER_H }}>
            <span className="fm-center-label">{object.label}</span>
            <span className="fm-center-meta">
              {parents.length} parent{parents.length === 1 ? '' : 's'} · {children.length} child
              {children.length === 1 ? '' : 'ren'}
            </span>
            <Link to={vmObjectPath(object.apiName)} className="fm-center-link">
              Object details →
            </Link>
          </div>
          <div className="fm-center-extras" style={{ top: centerY + CENTER_H / 2 + 8 }}>
            {object.selfReferences.map((r) => (
              <span key={r.id} className="fm-chip" title={r.note ?? undefined}>
                ↻ Self-reference: {r.fieldLabel}
              </span>
            ))}
            {object.standardLinks.map((l) => (
              <Link key={l.id} to={vmModelPath(l.other)} className="fm-chip fm-chip-link" title={l.note ?? undefined}>
                ⇄ {labelFor(l.other)} (standard link)
              </Link>
            ))}
          </div>
        </div>

        <div className="fm-col fm-col-right">
          <div className="fm-col-caption">Referenced by (children)</div>
          {children.length === 0 && <p className="fm-empty">No children</p>}
          {children.map((r, i) => (
            <Node key={r.id} apiName={r.child} relationship={r} side="right" top={rightTops[i]} />
          ))}
        </div>
      </div>

      {brackets.length > 0 && (
        <p className="fm-bracket-note">
          <strong>OR bracket:</strong> {withArticle(object.label)} references{' '}
          {brackets
            .map((b) => parents.slice(b.start, b.end + 1).map((r) => withArticle(labelFor(r.parent))).join(' OR '))
            .join('; ')}
          {' '}— one of them, not both.
        </p>
      )}
    </div>
  )
}
