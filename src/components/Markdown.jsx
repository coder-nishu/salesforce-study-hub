import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'

// Lightweight diagrams written as fenced code blocks, so the knowledge stays in Markdown.
//
// ```flow            vertical chain — one row per line, joined by ↓
// User | Record      `|` puts several nodes side by side on one row
// Flow starts
// !Action :: note    `!` highlights a node, `:: ` adds a detail line
// > Caption          a line starting with `> ` becomes the caption
// ```
//
// ```sequence        horizontal chain joined by →, wraps on small screens
// ```
function parseDiagram(source) {
  const rows = []
  let caption = null
  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('> ')) {
      caption = line.slice(2)
      continue
    }
    rows.push(
      line.split(/\s+\|\s+/).map((cell) => {
        const highlight = cell.startsWith('!')
        const [label, detail] = cell.replace(/^!/, '').split(/\s+::\s+/)
        return { label, detail, highlight }
      }),
    )
  }
  return { rows, caption }
}

function DiagramNode({ node }) {
  return (
    <div className={`diagram-node${node.highlight ? ' is-highlight' : ''}`}>
      <span className="diagram-node-label">{node.label}</span>
      {node.detail && <span className="diagram-node-detail">{node.detail}</span>}
    </div>
  )
}

function Diagram({ type, source }) {
  const { rows, caption } = parseDiagram(source)
  const nodes = rows.flat()

  return (
    <figure className={`diagram diagram-${type}`}>
      {type === 'sequence' ? (
        <ol className="diagram-sequence">
          {nodes.map((node, i) => (
            <li key={i}>
              <span className="diagram-step">{i + 1}</span>
              <DiagramNode node={node} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="diagram-flow-rows">
          {rows.map((row, i) => (
            <div key={i} className="diagram-flow-item">
              {i > 0 && <div className="diagram-arrow" aria-hidden="true">↓</div>}
              <div className="diagram-row">
                {row.map((node, j) => (
                  <DiagramNode key={j} node={node} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

const DIAGRAM_TYPES = new Set(['flow', 'sequence'])

function textOf(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value
  return (node.children ?? []).map(textOf).join('')
}

const components = {
  a({ href = '', children, node: _node, ...props }) {
    if (href.startsWith('/')) return <Link to={href}>{children}</Link>
    if (href.startsWith('#')) return <a href={href}>{children}</a>
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  },
  table({ node: _node, ...props }) {
    return (
      <div className="table-wrap">
        <table {...props} />
      </div>
    )
  },
  img({ node: _node, alt = '', ...props }) {
    return <img alt={alt} loading="lazy" {...props} />
  },
  pre({ node, children }) {
    const code = node?.children?.[0]
    const className = code?.properties?.className?.[0] ?? ''
    const lang = String(className).replace(/^language-/, '')
    if (DIAGRAM_TYPES.has(lang)) {
      return <Diagram type={lang} source={textOf(code)} />
    }
    return <pre className="code-block">{children}</pre>
  },
}

export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
