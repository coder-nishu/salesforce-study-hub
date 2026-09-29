import SourceBadge from './SourceBadge'

// A list of tagged learning explanations: [{ text, source }]
export default function WhyPanel({ title = 'Why does this exist?', question, items }) {
  if (!items?.length && !question) return null
  return (
    <section className="vm-why">
      <h3 className="vm-why-title">{title}</h3>
      {question && <p className="vm-why-question">{question}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.text}>
            <SourceBadge source={item.source} /> {item.text}
          </li>
        ))}
      </ul>
    </section>
  )
}
