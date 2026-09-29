import { Link } from 'react-router-dom'
import TopicCard from '../components/TopicCard'
import { topicPath } from '../data/navigation'

const COURSE_FEATURES = [
  { label: 'Certification Preparation' },
  { label: 'Core Admin Topics' },
  { label: 'Structured Study Notes' },
  { label: 'Practice Exams', soon: true },
]

export default function CourseOverview({ course }) {
  const firstPage = course.pages?.[0]

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-eyebrow">Course</div>
        <h1 className="page-title">{course.title}</h1>
        <p className="page-subtitle">{course.description}</p>
      </header>

      <ul className="feature-list">
        {COURSE_FEATURES.map((f) => (
          <li key={f.label} className={f.soon ? 'is-soon' : undefined}>
            <span className="feature-dot" aria-hidden="true" />
            {f.label}
            {f.soon && <span className="pill">Coming soon</span>}
          </li>
        ))}
        {course.exam && (
          <li className="feature-exam">
            {course.exam.questions} questions · {course.exam.minutes} minutes
          </li>
        )}
      </ul>

      {firstPage && (
        <Link to={topicPath(course.slug, firstPage.slug)} className="start-callout">
          <span>
            <span className="start-callout-label">Start here</span>
            <span className="start-callout-title">{firstPage.title}</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <section>
        <h2 className="section-label">
          Domains <span className="section-count">{course.topics.length}</span>
        </h2>
        <div className="card-grid">
          {course.topics.map((topic, i) => (
            <TopicCard
              key={topic.slug}
              index={i + 1}
              title={topic.title}
              description={topic.description}
              meta={
                topic.subtopics.length
                  ? `${topic.subtopics.length} subtopics`
                  : 'Coming soon'
              }
              to={topicPath(course.slug, topic.slug)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
