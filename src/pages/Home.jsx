import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseIcon } from '../components/CourseSwitcher'
import { catalog, catalogPlaceholder } from '../data/navigation'
import { JUMP_SHORTCUT } from '../lib/platform'
import { lastVisit } from '../lib/theme'

const HOW_IT_WORKS = [
  { title: 'Courses', text: 'Read structured notes by domain, then revise with exam shortcuts, gotchas and a Before Exam summary.' },
  { title: 'Labs', text: 'Practise in a small simulated org: create records, connect them, and see what happens.' },
  { title: `Jump to (${JUMP_SHORTCUT})`, text: 'Go to any course, topic, page or object from anywhere on the site.' },
]

export default function Home() {
  const [recent] = useState(lastVisit)

  return (
    <div className="page page-wide catalog">
      <header className="page-header">
        <h1 className="page-title">Salesforce Study Hub</h1>
        <p className="page-subtitle">
          A personal learning site for Salesforce — certification courses to read and revise, and interactive labs to
          practise in. Pick where to start.
        </p>
      </header>

      {recent && (
        <Link to={recent.path} className="continue-card">
          <span className="continue-kicker">Continue where you left off</span>
          <span className="continue-title">{recent.title}</span>
          <span className="continue-course">
            <CourseIcon kind={recent.kind} /> {recent.course}
          </span>
          <span className="continue-arrow" aria-hidden="true">→</span>
        </Link>
      )}

      <section className="catalog-section">
        <h2 className="section-label">
          Choose what to learn <span className="section-count">{catalog.length}</span>
        </h2>
        <div className="catalog-grid">
          {catalog.map((entry) => (
            <Link key={entry.slug} to={entry.path} className={`catalog-card catalog-card-${entry.kind}`}>
              <span className="catalog-card-top">
                <CourseIcon kind={entry.kind} />
                <span className="catalog-kind">{entry.kindLabel}</span>
              </span>
              <span className="catalog-title">{entry.title}</span>
              <span className="catalog-tagline">{entry.tagline}</span>
              <span className="catalog-stats">
                {entry.stats.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
              <span className="catalog-cta">{recent?.course === entry.title ? 'Continue' : 'Start'} →</span>
            </Link>
          ))}
          <div className="catalog-card catalog-card-soon" aria-label={catalogPlaceholder.title}>
            <span className="catalog-card-top">
              <span className="course-icon" aria-hidden="true">＋</span>
              <span className="catalog-kind">Coming later</span>
            </span>
            <span className="catalog-title">{catalogPlaceholder.title}</span>
            <span className="catalog-tagline">{catalogPlaceholder.text}</span>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <h2 className="section-label">How this site works</h2>
        <div className="how-grid">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.title} className="how-tile">
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <p className="catalog-hint">
          You can switch course at any time from the course button at the top of the page or in the sidebar.
        </p>
      </section>
    </div>
  )
}
