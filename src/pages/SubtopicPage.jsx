import ComingSoon from '../components/ComingSoon'
import ContentPage from '../components/ContentPage'
import { coursePath, topicPath } from '../data/navigation'
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
      <ComingSoon title={subtopic.title} />
    </ContentPage>
  )
}
