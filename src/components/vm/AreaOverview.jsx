import { Link } from 'react-router-dom'
import { vmModelPath } from '../../data/navigation'
import { areas, getObject, labelFor, objectsByArea } from '../../data/npc-vm'

// All five ERD areas as panels. The selected object's parents, children and
// standard links are highlighted — including those in other areas.
export default function AreaOverview({ selected, hrefFor = vmModelPath }) {
  const object = getObject(selected)
  const parents = new Set(object.parents.map((r) => r.parent))
  const children = new Set(object.children.map((r) => r.child))
  const linked = new Set(object.standardLinks.map((l) => l.other))
  parents.delete(selected)

  const connected = new Set([...parents, ...children, ...linked])
  const crossArea = [...connected].filter((api) => getObject(api).area !== object.area)

  function roleOf(apiName) {
    if (apiName === selected) return 'selected'
    if (parents.has(apiName) && children.has(apiName)) return 'both'
    if (parents.has(apiName)) return 'parent'
    if (children.has(apiName)) return 'child'
    if (linked.has(apiName)) return 'linked'
    return 'none'
  }

  return (
    <div className="ao">
      <p className="ao-summary">
        <strong>{object.label}</strong> connects to {connected.size} object{connected.size === 1 ? '' : 's'}
        {crossArea.length > 0 ? (
          <>
            {' '}— {crossArea.length} in other areas:{' '}
            {crossArea.map((api, i) => (
              <span key={api}>
                {i > 0 && ', '}
                <Link to={hrefFor(api)}>{labelFor(api)}</Link>
              </span>
            ))}
            .
          </>
        ) : (
          ', all in the same area.'
        )}
      </p>

      <div className="ao-grid">
        {areas.map((area) => (
          <section key={area.id} className={`ao-panel vm-area-${area.colorToken}`}>
            <h3 className="ao-panel-title">{area.label}</h3>
            <ul className="ao-list">
              {objectsByArea.get(area.id).map((obj) => {
                const role = roleOf(obj.apiName)
                return (
                  <li key={obj.apiName}>
                    <Link
                      to={hrefFor(obj.apiName)}
                      className={`ao-item is-${role}`}
                      aria-current={role === 'selected' ? 'true' : undefined}
                    >
                      {obj.label}
                      {role !== 'none' && role !== 'selected' && (
                        <span className="ao-role">{role === 'both' ? 'parent · child' : role}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
