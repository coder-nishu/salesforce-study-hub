import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AreaOverview from '../../components/vm/AreaOverview'
import Breadcrumbs from '../../components/Breadcrumbs'
import FocusMap from '../../components/vm/FocusMap'
import { vmModelPath, vmObjectPath, vmPath } from '../../data/navigation'
import { areas, getObject, objectsByArea } from '../../data/npc-vm'

const DEFAULT_FOCUS = 'JobPosition'

export default function VmModel() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const requested = params.get('focus')
  const focus = getObject(requested) ? requested : DEFAULT_FOCUS
  const object = getObject(focus)

  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: 'Volunteer Management Lab', to: vmPath }, { label: 'Relationship Map' }]} />
      <header className="page-header">
        <h1 className="page-title">Relationship Map</h1>
        <p className="page-subtitle">
          Pick an object to put it in focus. Click any neighbour to re-centre the map on it.
        </p>
      </header>

      {requested && !getObject(requested) && (
        <p className="vm-todo-banner">Unknown object “{requested}” — showing {object.label} instead.</p>
      )}

      <div className="vm-map-toolbar">
        <label className="vm-select">
          <span>Focus object</span>
          <select
            value={focus}
            onChange={(e) => navigate(vmModelPath(e.target.value))}
          >
            {areas.map((a) => (
              <optgroup key={a.id} label={a.label}>
                {objectsByArea.get(a.id).map((o) => (
                  <option key={o.apiName} value={o.apiName}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <ul className="vm-legend" aria-label="Legend">
          <li><span className="vm-legend-line is-md" /> Master-detail</li>
          <li><span className="vm-legend-line is-lk" /> Lookup</li>
          <li><span className="vm-legend-line is-verify" /> Verify against source</li>
          <li><span className="vm-legend-or">OR</span> One-of constraint</li>
        </ul>
      </div>

      <section className="vm-section">
        <h2 className="section-label">Focus view</h2>
        <FocusMap apiName={focus} />
      </section>

      <section className="vm-section">
        <h2 className="section-label">Area overview</h2>
        <AreaOverview selected={focus} />
      </section>

      <p className="vm-footnote">
        Tip: every object also has a <Link to={vmObjectPath(focus)}>details page</Link> with its fields and
        plain-language relationship descriptions.
      </p>
    </div>
  )
}
