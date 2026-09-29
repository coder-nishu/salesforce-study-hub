import { Link, useLocation } from 'react-router-dom'
import { coursePath, getPrevNext } from '../data/navigation'
import { getSectionKind, splitBlocks, splitSections } from '../lib/content'
import BeforeExam from './BeforeExam'
import Breadcrumbs from './Breadcrumbs'
import ContentCallout from './ContentCallout'
import ContentToc from './ContentToc'
import Markdown from './Markdown'
import ScenarioCard from './ScenarioCard'

// Renders a special block (callout / scenario / before exam) or plain Markdown.
function Block({ kind, heading, level, id, body }) {
  if (kind === 'scenario') {
    return <ScenarioCard heading={heading} level={level} id={id} body={body} />
  }
  if (kind === 'before-exam') {
    return <BeforeExam heading={heading} id={id} body={body} />
  }
  if (kind) {
    return <ContentCallout kind={kind} heading={heading} level={level} id={id} body={body} />
  }
  return <Markdown>{body}</Markdown>
}

function SectionBody({ body }) {
  return splitBlocks(body).map((block, i) => (
    <Block key={i} {...block} level={3} />
  ))
}

function MarkdownSections({ sections }) {
  return sections.map((section, i) => {
    if (!section.heading) {
      return (
        <div key={i} className="doc-intro">
          <SectionBody body={section.body} />
        </div>
      )
    }
    const kind = getSectionKind(section.heading)
    if (kind) {
      return (
        <div key={section.id} className="doc-section doc-section-special">
          <Block kind={kind} heading={section.heading} level={2} id={section.id} body={section.body} />
        </div>
      )
    }
    return (
      <section key={section.id} id={section.id} className="doc-section">
        <h2>{section.heading}</h2>
        <SectionBody body={section.body} />
      </section>
    )
  })
}

// Main reading frame for every learning page:
// breadcrumbs → title → summary → tags → content → previous / next.
// Pass `content` (Markdown) for real pages, or `children` for placeholders.
export default function ContentPage({ course, breadcrumbs, title, summary, tags, content, children }) {
  const { pathname } = useLocation()
  const { prev, next } = getPrevNext(course, pathname)
  const back = prev ?? { title: course.title, path: coursePath(course.slug) }

  const sections = content ? splitSections(content) : []
  const toc = sections.filter((s) => s.heading)
  const hasToc = toc.length > 1

  return (
    <div className={`doc-layout${hasToc ? ' has-toc' : ''}`}>
      <article className="doc">
        <Breadcrumbs items={breadcrumbs} />
        <header className="doc-header">
          <h1 className="doc-title">{title}</h1>
          {summary && <p className="doc-lead">{summary}</p>}
          {tags?.length > 0 && (
            <ul className="doc-tags" aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag} className={tag === 'high-yield' ? 'is-high-yield' : undefined}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        {hasToc && <ContentToc sections={toc} variant="inline" />}

        <div className="doc-body">
          {content ? <MarkdownSections sections={sections} /> : children}
        </div>

        <nav className="pager" aria-label="Page navigation">
          <Link to={back.path} className="pager-link">
            <span className="pager-label">Previous</span>
            <span className="pager-title">← {back.title}</span>
          </Link>
          {next && (
            <Link to={next.path} className="pager-link pager-next">
              <span className="pager-label">Next</span>
              <span className="pager-title">{next.title} →</span>
            </Link>
          )}
        </nav>
      </article>

      {hasToc && <ContentToc sections={toc} variant="aside" />}
    </div>
  )
}
