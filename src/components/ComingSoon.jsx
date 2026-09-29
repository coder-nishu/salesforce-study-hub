import { Link } from 'react-router-dom'

// Placeholder for pages without content yet. `links` point somewhere useful instead of a dead end.
export default function ComingSoon({ title = 'Coming soon', children, links = [], linksLabel = 'Explore instead' }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-badge">Coming soon</div>
      <p className="coming-soon-title">{title}</p>
      <p className="coming-soon-text">
        {children ?? 'Study notes for this section haven’t been written yet. The page is in place and ready for content.'}
      </p>
      {links.length > 0 && (
        <div className="coming-soon-links">
          <span>{linksLabel}:</span>
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
