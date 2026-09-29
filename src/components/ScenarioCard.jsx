import Markdown from './Markdown'

// "## Scenario: Title" — a worked Salesforce situation (not a quiz).
// Body paragraphs that start with a bold label (e.g. **Think about:**) become labelled rows.
export default function ScenarioCard({ heading, level = 2, id, body }) {
  const Heading = `h${level}`
  const title = heading.replace(/^scenario\s*[:—–-]?\s*/i, '')
  return (
    <section id={id} className="scenario-card">
      <div className="scenario-card-label">Scenario</div>
      {title && <Heading className="scenario-card-title">{title}</Heading>}
      <Markdown>{body}</Markdown>
    </section>
  )
}
