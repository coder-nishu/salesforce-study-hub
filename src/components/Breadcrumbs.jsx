import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// items: [{ label, to? }] — the last item is rendered as the current page.
// Every trail starts at "All courses" so the course catalog is always one click away.
export default function Breadcrumbs({ items }) {
  const trail = [{ label: 'All courses', to: '/', home: true }, ...items]
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1
        return (
          <Fragment key={item.label + i}>
            {isLast || !item.to ? (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            ) : (
              <Link to={item.to} className={item.home ? 'breadcrumbs-home' : undefined}>
                {item.home && <span aria-hidden="true">⌂ </span>}
                {item.label}
              </Link>
            )}
            {!isLast && <span className="breadcrumbs-sep" aria-hidden="true">/</span>}
          </Fragment>
        )
      })}
    </nav>
  )
}
