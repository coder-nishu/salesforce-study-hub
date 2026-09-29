import { coursePath, subtopicPath, topicPath } from '../data/navigation'
import Breadcrumbs from '../components/Breadcrumbs'
import ComingSoon from '../components/ComingSoon'
import TopicCard from '../components/TopicCard'

export default function TopicPage({ course, topic }) {
  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: course.title, to: coursePath(course.slug) },
          { label: topic.title },
        ]}
      />
      <header className="page-header">
        <h1 className="page-title">{topic.title}</h1>
        <p className="page-subtitle">{topic.summary ?? topic.description}</p>
      </header>

      {topic.subtopics.length > 0 ? (
        <section>
          <h2 className="section-label">
            Subtopics <span className="section-count">{topic.subtopics.length}</span>
          </h2>
          <div className="card-grid">
            {topic.subtopics.map((sub, i) => (
              <TopicCard
                key={sub.slug}
                index={i + 1}
                title={sub.title}
                to={subtopicPath(course.slug, topic.slug, sub.slug)}
              />
            ))}
          </div>
        </section>
      ) : (
        <ComingSoon
          title={topic.title}
          linksLabel="Other domains"
          links={course.topics.filter((t) => t.slug !== topic.slug && t.subtopics.length).map((t) => ({ label: t.title, to: topicPath(course.slug, t.slug) }))}
        />
      )}
    </div>
  )
}
