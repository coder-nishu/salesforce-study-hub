import { useEffect, useState } from 'react'

// "On this page" navigation built from the page's h2 sections.
// variant="aside": sticky desktop column with active-section highlighting.
// variant="inline": collapsible block above the article (tablet / mobile).
export default function ContentToc({ sections, variant }) {
  const [activeId, setActiveId] = useState(null)

  // Highlight the last section whose top has scrolled above the reading line.
  useEffect(() => {
    if (variant !== 'aside') return
    let frame = 0
    const update = () => {
      frame = 0
      const line = 120
      let current = sections[0]?.id ?? null
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActiveId(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [sections, variant])

  const list = (
    <ol className="toc-list">
      {sections.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={s.id === activeId ? 'is-active' : undefined}>
            {s.heading}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'inline') {
    return (
      <details className="toc toc-inline">
        <summary>On this page</summary>
        {list}
      </details>
    )
  }

  return (
    <nav className="toc toc-aside" aria-label="On this page">
      <div className="toc-title">On this page</div>
      {list}
    </nav>
  )
}
