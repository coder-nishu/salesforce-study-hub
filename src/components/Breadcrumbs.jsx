import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// items: [{ label, to? }] — the last item is rendered as the current page.
export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Fragment key={item.label + i}>
            {isLast || !item.to ? (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
            {!isLast && <span className="breadcrumbs-sep" aria-hidden="true">/</span>}
          </Fragment>
        )
      })}
    </nav>
  )
}
