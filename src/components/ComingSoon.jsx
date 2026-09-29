export default function ComingSoon({ title = 'Coming soon', children }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-badge">Coming soon</div>
      <p className="coming-soon-title">{title}</p>
      <p className="coming-soon-text">
        {children ?? 'Study notes for this section haven’t been written yet. The page is in place and ready for content.'}
      </p>
    </div>
  )
}
