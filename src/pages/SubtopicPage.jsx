import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import ComingSoon from '../components/ComingSoon'
import ContentPage from '../components/ContentPage'
import { coursePath, subtopicPath, topicPath } from '../data/navigation'
import { hasContent } from '../lib/content'
import { getContentPage } from '../lib/content'

// Renders src/content/<course>/<topic>/<subtopic>.md, or Coming Soon when it doesn't exist.
export default function SubtopicPage({ course, topic, subtopic }) {
  const page = getContentPage(course.slug, topic.slug, subtopic.slug)
  const meta = page?.frontmatter ?? {}

  return (
    <ContentPage
      course={course}
      breadcrumbs={[
        { label: course.title, to: coursePath(course.slug) },
        { label: topic.title, to: topicPath(course.slug, topic.slug) },
        { label: subtopic.title },
      ]}
      title={meta.title ?? subtopic.title}
      summary={meta.summary}
      tags={meta.tags}
      content={page?.content}
    >
      {subtopic.seeAlso?.length > 0 && (
        <div className="see-also">
          <strong>Already covered:</strong> this topic is taught in{' '}
          {subtopic.seeAlso.map((s, i) => (
            <Fragment key={s.path}>
              {i > 0 && ', '}
              <Link to={s.path}>{s.label} →</Link>
            </Fragment>
          ))}
        </div>
      )}
      <ComingSoon
        title={subtopic.title}
        linksLabel={`Other ${topic.title} topics`}
        links={[
          ...topic.subtopics
            .filter((s) => s.slug !== subtopic.slug)
            .map((s) => ({
              label: `${s.title}${hasContent(course.slug, topic.slug, s.slug) ? ' ✓' : ''}`,
              to: subtopicPath(course.slug, topic.slug, s.slug),
            })),
          { label: `All ${topic.title}`, to: topicPath(course.slug, topic.slug) },
        ]}
      />
    </ContentPage>
  )
}
