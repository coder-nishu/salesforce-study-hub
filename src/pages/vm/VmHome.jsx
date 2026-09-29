import { useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import ContentCallout from '../../components/ContentCallout'
import Markdown from '../../components/Markdown'
import {
  getLab,
  vmDashboardPath,
  vmFindVolunteersPath,
  vmModelPath,
  vmObjectsPath,
  vmRecordsPath,
  vmScenariosPath,
  vmUseCasePath,
} from '../../data/navigation'
import { areas, objectsByArea, totals } from '../../data/npc-vm'
import { getContentPage, splitBlocks } from '../../lib/content'
import { volunteers } from '../../lib/vm/matching'
import { recordsOf } from '../../lib/vm/records'
import { useVmStore } from '../../lib/vm/storeContext'

const HOW_TO_READ = getContentPage('npc-vm', 'how-to-read')

const PATHWAYS = [
  { to: vmModelPath(), title: 'Explore the Data Model', desc: 'Objects, relationships, and how the areas connect.' },
  { to: vmUseCasePath('volunteer-profile'), title: 'Create a Volunteer', desc: 'Person Account, competencies and availability.' },
  { to: vmUseCasePath('volunteer-program'), title: 'Create a Volunteer Initiative', desc: 'Initiative, positions, qualifications and shifts.' },
  { to: vmUseCasePath('position-vs-job-position'), title: 'Create a Job Position', desc: 'Position vs Job Position, and their qualifications.' },
  { to: vmUseCasePath('match-volunteers'), title: 'Match a Volunteer', desc: 'Qualification, date/time and location — and why.' },
  { to: vmUseCasePath('assign-volunteer'), title: 'Assign a Volunteer', desc: 'Create an assignment and watch capacity change.' },
  { to: vmScenariosPath, title: 'Explore Scenarios', desc: 'All 12 interactive scenarios.' },
]

function ResetControls() {
  const { records, resetDemo, resetEmpty } = useVmStore()
  const [confirm, setConfirm] = useState(null)
  const all = Object.values(records)
  const mine = all.filter((r) => r.origin === 'user').length
  const actions = {
    demo: { label: 'Reset Demo Data', text: 'Restore the original demo records and remove everything you created.', run: resetDemo },
    empty: { label: 'Reset Everything', text: 'Start from an empty org — no records at all. Good for building the health camp from scratch.', run: resetEmpty },
  }
  return (
    <section className="vm-section vm-reset">
      <h2 className="section-label">Your lab data</h2>
      <p className="vm-section-hint">
        {all.length} records — {all.length - mine} demo, {mine} created by you. Saved in this browser only.
      </p>
      {confirm ? (
        <div className="vm-delete-confirm" role="alertdialog" aria-label={actions[confirm].label}>
          <p><strong>{actions[confirm].label}?</strong> {actions[confirm].text}</p>
          <div className="vm-form-actions">
            <button type="button" className="vm-button vm-button-danger" onClick={() => { actions[confirm].run(); setConfirm(null) }}>
              Yes, {actions[confirm].label.toLowerCase()}
            </button>
            <button type="button" className="vm-button" onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="vm-form-actions">
          <button type="button" className="vm-button" onClick={() => setConfirm('demo')}>Reset Demo Data</button>
          <button type="button" className="vm-button" onClick={() => setConfirm('empty')}>Reset Everything</button>
        </div>
      )}
    </section>
  )
}

export default function VmHome() {
  const lab = getLab('vm')
  const { records } = useVmStore()
  const count = (apiName) => recordsOf(records, apiName).length
  const live = [
    { label: 'Objects', value: totals.objects, to: vmObjectsPath },
    { label: 'Records', value: Object.keys(records).length, to: vmDashboardPath },
    { label: 'Relationships', value: totals.relationships, to: vmModelPath() },
    { label: 'Volunteers', value: volunteers(records).length, to: vmRecordsPath('Account', 'AccountType:Person Account') },
    { label: 'Initiatives', value: count('VolunteerInitiative'), to: vmRecordsPath('VolunteerInitiative') },
    { label: 'Job Positions', value: count('JobPosition'), to: vmRecordsPath('JobPosition') },
    { label: 'Shifts', value: count('JobPositionShift'), to: vmRecordsPath('JobPositionShift') },
    { label: 'Assignments', value: count('JobPositionAssignment'), to: vmRecordsPath('JobPositionAssignment') },
  ]

  return (
    <div className="page page-wide">
      <Breadcrumbs items={[{ label: lab.title }]} />
      <header className="page-header">
        <div className="page-eyebrow">Interactive lab · Nonprofit Cloud</div>
        <h1 className="page-title">{lab.title}</h1>
        <p className="page-subtitle">
          This is an interactive learning environment for understanding the NPC Volunteer Management data model and its
          real-world use cases.
        </p>
      </header>

      <p className="vm-phase-note">
        A learning simulator — not a Salesforce runtime. The object set and relationships come from your ERD; fields and
        matching rules follow the official Salesforce documentation where available, and every simplification is labelled.
      </p>

      <dl className="vm-stats vm-stats-live">
        {live.map((s) => (
          <Link key={s.label} to={s.to}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </Link>
        ))}
      </dl>

      <section className="vm-section">
        <h2 className="section-label">Start learning</h2>
        <ol className="vm-pathways">
          {PATHWAYS.map((p, i) => (
            <li key={p.title}>
              <Link to={p.to}>
                <span className="vm-pathway-num">{i + 1}</span>
                <span className="vm-pathway-title">{p.title}</span>
                <span className="vm-pathway-desc">{p.desc}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="vm-section-hint">
          Or jump straight to <Link to={vmFindVolunteersPath}>Find Volunteers</Link> or the <Link to={vmDashboardPath}>Dashboard</Link>.
        </p>
      </section>

      <section className="vm-section">
        <h2 className="section-label">
          Areas <span className="section-count">{totals.areas}</span>
        </h2>
        <div className="vm-area-grid">
          {areas.map((area) => {
            const list = objectsByArea.get(area.id)
            const recordCount = list.reduce((n, o) => n + count(o.apiName), 0)
            return (
              <Link key={area.id} to={`${vmObjectsPath}?area=${area.id}`} className={`vm-area-card vm-area-${area.colorToken}`}>
                <span className="vm-area-card-title">{area.label}</span>
                <span className="vm-area-card-meta">
                  {list.length} object{list.length === 1 ? '' : 's'} · {recordCount} records
                </span>
                <span className="vm-area-card-list">{list.map((o) => o.label).join(' · ')}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <ResetControls />

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
