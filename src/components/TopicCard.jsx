import { Link } from 'react-router-dom'

export default function TopicCard({ to, index, title, description, meta }) {
  return (
    <Link to={to} className="topic-card">
      {index != null && (
        <span className="topic-card-index">{String(index).padStart(2, '0')}</span>
      )}
      <span className="topic-card-body">
        <span className="topic-card-title">{title}</span>
        {description && <span className="topic-card-desc">{description}</span>}
        {meta && <span className="topic-card-meta">{meta}</span>}
      </span>
      <span className="topic-card-arrow" aria-hidden="true">→</span>
    </Link>
  )
}
