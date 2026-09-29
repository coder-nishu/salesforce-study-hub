import { Link } from 'react-router-dom'
import ContentCallout from '../../components/ContentCallout'
import Markdown from '../../components/Markdown'
import { getLab, vmModelPath, vmObjectsPath } from '../../data/navigation'
import { areas, objectsByArea, totals } from '../../data/npc-vm'
import { getContentPage, splitBlocks } from '../../lib/content'

const HOW_TO_READ = getContentPage('npc-vm', 'how-to-read')

export default function VmHome() {
  const lab = getLab('vm')

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-eyebrow">Nonprofit Cloud · Data model lab</div>
        <h1 className="page-title">{lab.title}</h1>
        <p className="page-subtitle">{lab.description}</p>
      </header>

      <div className="vm-phase-note">
        <strong>Phase 1 — schema only.</strong> Objects and relationships from the Volunteer Management
        ERD. Field lists, descriptions and verified API names are not supplied yet, and there are no
        records.
      </div>

      <dl className="vm-stats">
        <div>
          <dt>Objects</dt>
          <dd>{totals.objects}</dd>
        </div>
        <div>
          <dt>Relationships</dt>
          <dd>{totals.relationships}</dd>
        </div>
        <div>
          <dt>Standard / license</dt>
          <dd>
            {totals.standardObjects} <span>/</span> {totals.licenseObjects}
          </dd>
        </div>
        <div>
          <dt>Lookup / master-detail</dt>
          <dd>
            {totals.lookups} <span>/</span> {totals.masterDetails}
          </dd>
        </div>
      </dl>

      <div className="vm-entry-grid">
        <Link to={vmObjectsPath} className="vm-entry">
          <span className="vm-entry-title">Object Explorer →</span>
          <span className="vm-entry-desc">Browse and search all {totals.objects} objects by area.</span>
        </Link>
        <Link to={vmModelPath()} className="vm-entry">
          <span className="vm-entry-title">Relationship Map →</span>
          <span className="vm-entry-desc">Put one object in focus and walk its parents and children.</span>
        </Link>
      </div>

      <section className="vm-section">
        <h2 className="section-label">
          Areas <span className="section-count">{totals.areas}</span>
        </h2>
        <div className="vm-area-grid">
          {areas.map((area) => {
            const list = objectsByArea.get(area.id)
            const standard = list.filter((o) => o.isStandard).length
            return (
              <Link
                key={area.id}
                to={`${vmObjectsPath}?area=${area.id}`}
                className={`vm-area-card vm-area-${area.colorToken}`}
              >
                <span className="vm-area-card-title">{area.label}</span>
                <span className="vm-area-card-meta">
                  {list.length} object{list.length === 1 ? '' : 's'}
                  {standard > 0 && ` · ${standard} standard`}
                </span>
                <span className="vm-area-card-list">{list.map((o) => o.label).join(' · ')}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {HOW_TO_READ && (
        <section className="vm-section vm-how-to-read">
          <h2 className="section-label">{HOW_TO_READ.frontmatter.title}</h2>
          {splitBlocks(HOW_TO_READ.content).map((block, i) =>
            block.kind ? (
              <ContentCallout key={i} kind={block.kind} heading={block.heading} level={3} body={block.body} />
            ) : (
              <Markdown key={i}>{block.body}</Markdown>
            ),
          )}
        </section>
      )}
    </div>
  )
}
