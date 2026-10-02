import { coursePath, groupSubtopics, subtopicPath, topicPath } from '../data/navigation'
import { hasContent } from '../lib/content'
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
        groupSubtopics(topic).map((group) => (
          <section key={group.module?.id ?? 'topics'} className="topic-module">
            <h2 className="section-label">
              {group.module ? group.module.title : topic.modules?.length ? 'Topics' : 'Subtopics'}{' '}
              <span className="section-count">{group.subtopics.length}</span>
            </h2>
            {group.module?.description && <p className="topic-module-desc">{group.module.description}</p>}
            <div className="card-grid">
              {group.subtopics.map((sub, i) => (
                <TopicCard
                  key={sub.slug}
                  index={i + 1}
                  title={sub.title}
                  meta={
                    hasContent(course.slug, topic.slug, sub.slug) ? (
                      <span className="ready-meta"><span className="ready-dot" aria-hidden="true" />Notes ready</span>
                    ) : (
                      'Coming soon'
                    )
                  }
                  to={subtopicPath(course.slug, topic.slug, sub.slug)}
                />
              ))}
            </div>
          </section>
        ))
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
