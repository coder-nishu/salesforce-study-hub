import Markdown from './Markdown'

const VARIANTS = {
  shortcut: { icon: '⭐', label: 'Exam shortcut' },
  gotcha: { icon: '⚠', label: 'Gotcha' },
  memory: { icon: '🧠', label: 'Memory trick' },
}

// Callout for "Exam shortcuts", "Gotchas" and "Memory tricks" sections.
// `heading` is the Markdown heading text; `level` is the heading level it came from.
export default function ContentCallout({ kind, heading, level = 2, id, body }) {
  const variant = VARIANTS[kind]
  const Heading = `h${level}`
  return (
    <section id={id} className={`callout-box callout-${kind}`}>
      <Heading className="callout-box-title">
        <span className="callout-box-icon" aria-hidden="true">{variant.icon}</span>
        {heading || variant.label}
      </Heading>
      <Markdown>{body}</Markdown>
    </section>
  )
}
