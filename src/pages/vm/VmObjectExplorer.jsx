import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { ApiNameBadge, ObjectKindBadge } from '../../components/vm/VmBadges'
import { vmObjectPath, vmPath } from '../../data/navigation'
import { areas, areasById, objectsByArea, totals } from '../../data/npc-vm'
import { recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'standard', label: 'Standard' },
  { id: 'license', label: 'License / custom' },
]

export default function VmObjectExplorer() {
  // The area filter lives in the URL so area links (sidebar, lab home) work.
  // Search text and object type are local state — they don't need to be linkable.
  const [params, setParams] = useSearchParams()
  const { records } = useVmStore()
  const areaFilter = areasById.has(params.get('area')) ? params.get('area') : 'all'
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')

  function setArea(value) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all') next.delete('area')
        else next.set('area', value)
        return next
      },
      { replace: true },
    )
  }

  const needle = query.trim().toLowerCase()
  const matches = (obj) =>
    (!needle || obj.label.toLowerCase().includes(needle) || obj.apiName.toLowerCase().includes(needle)) &&
    (kind === 'all' || (kind === 'standard') === obj.isStandard)

  const groups = areas
    .filter((a) => areaFilter === 'all' || a.id === areaFilter)
    .map((a) => ({ area: a, objects: objectsByArea.get(a.id).filter(matches) }))
    .filter((g) => g.objects.length > 0)
  const shown = groups.reduce((n, g) => n + g.objects.length, 0)

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Volunteer Management Lab', to: vmPath }, { label: 'Object Explorer' }]} />
      <header className="page-header">
        <h1 className="page-title">Object Explorer</h1>
        <p className="page-subtitle">All {totals.objects} objects on the Volunteer Management ERD, grouped by area.</p>
      </header>

      <div className="vm-filters">
        <label className="vm-search">
          <span className="visually-hidden">Search objects</span>
          <input
            type="search"
            placeholder="Search by label or API name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="vm-select">
          <span>Area</span>
          <select value={areaFilter} onChange={(e) => setArea(e.target.value)}>
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <div className="vm-segmented" role="group" aria-label="Object type">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={kind === k.id}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <p className="vm-result-count" aria-live="polite">
        Showing {shown} of {totals.objects} objects
      </p>

      {groups.length === 0 && <p className="vm-empty">No objects match these filters.</p>}

      {groups.map(({ area, objects }) => (
        <section key={area.id} className="vm-section">
          <h2 className="vm-group-title">
            <span className={`vm-dot vm-area-${area.colorToken}`} aria-hidden="true" />
            {area.label} <span className="section-count">{objects.length}</span>
          </h2>
          <ul className="vm-object-list">
            {objects.map((obj) => (
              <li key={obj.apiName}>
                <Link to={vmObjectPath(obj.apiName)} className="vm-object-row">
                  <span className="vm-object-row-main">
                    <span className="vm-object-row-label">{obj.label}</span>
                    <code>{obj.apiName}</code>
                  </span>
                  <span className="vm-object-row-badges">
                    <ObjectKindBadge object={obj} />
                    <ApiNameBadge status={obj.apiNameStatus} />
                  </span>
                  <span className="vm-object-row-counts">
                    {obj.fields.length} fields · {obj.parents.length + obj.children.length} relationships ·{' '}
                    <strong>{recordsOf(records, obj.apiName).length} records</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
