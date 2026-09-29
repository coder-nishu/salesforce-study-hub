import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-header">
        <div className="page-eyebrow">404</div>
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">
          This page doesn’t exist in the study hub.
        </p>
      </header>
      <Link to="/" className="button">← Back to Salesforce Study Hub</Link>
    </div>
  )
}
