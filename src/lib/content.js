// Build-time Markdown content loader.
//
// Every file under src/content/ is bundled at build time (no fetch, no network).
// The file path is the source of truth for URL mapping:
//
//   src/content/salesforce-admin/introduction.md       → /salesforce-admin/introduction
//   src/content/salesforce-admin/automation/flows.md   → /salesforce-admin/automation/flows

import matter from 'gray-matter'

// gray-matter calls Buffer.from() to populate `file.orig`, which we never use.
// Browsers have no Buffer, so provide the minimum it needs.
globalThis.Buffer ??= { from: (value) => value }

const files = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// '../content/salesforce-admin/automation/flows.md' → 'salesforce-admin/automation/flows'
function toContentPath(filePath) {
  return filePath.replace(/^\.\.\/content\//, '').replace(/\.md$/, '')
}

const pages = new Map(
  Object.entries(files).map(([filePath, raw]) => {
    const { data, content } = matter(raw)
    const path = toContentPath(filePath)
    return [path, { frontmatter: data, content, path }]
  }),
)

function buildPath(course, topic, subtopic) {
  return [course, topic, subtopic].filter(Boolean).join('/')
}

// Returns { frontmatter, content, path } or null when no Markdown file exists.
export function getContentPage(course, topic, subtopic) {
  return pages.get(buildPath(course, topic, subtopic)) ?? null
}

export function hasContent(course, topic, subtopic) {
  return pages.has(buildPath(course, topic, subtopic))
}

export function getAllContentPages() {
  return [...pages.values()]
}

// ---------- Section parsing ----------

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9$]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Splits Markdown into sections at each `## ` heading (ignoring fenced code blocks).
// Content before the first heading is returned with `heading: null`.
// Each section: { heading, id, body }
export function splitSections(markdown) {
  const sections = []
  const usedIds = new Map()
  let current = { heading: null, id: null, lines: [] }
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const match = !inFence && /^##\s+(.+?)\s*#*\s*$/.exec(line)
    if (match) {
      sections.push(current)
      const heading = match[1]
      const base = slugify(heading) || 'section'
      const count = usedIds.get(base) ?? 0
      usedIds.set(base, count + 1)
      current = { heading, id: count ? `${base}-${count + 1}` : base, lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)

  return sections
    .map(({ lines, ...rest }) => ({ ...rest, body: lines.join('\n').trim() }))
    .filter((s) => s.heading || s.body)
}

// Special learning/revision headings recognised by the renderer.
const SECTION_KINDS = [
  { kind: 'shortcut', pattern: /^exam shortcuts?\b/i },
  { kind: 'gotcha', pattern: /^gotchas?\b/i },
  { kind: 'memory', pattern: /^memory tricks?\b/i },
  { kind: 'before-exam', pattern: /^before exam\b/i },
  { kind: 'scenario', pattern: /^scenario\b/i },
]

// 'Exam shortcuts' → 'shortcut', 'Scenario: Wrong run order' → 'scenario', else null.
export function getSectionKind(heading) {
  if (!heading) return null
  return SECTION_KINDS.find(({ pattern }) => pattern.test(heading))?.kind ?? null
}

// Splits a section body at special `### ` headings (e.g. `### Gotcha`) so they can be
// rendered as inline callouts. A special block runs until the next `### ` heading or
// the end of the section. Ordinary `### ` headings stay in the Markdown untouched.
// Each block: { kind, heading, body } — `kind` is null for plain Markdown.
export function splitBlocks(markdown) {
  const blocks = []
  let current = { kind: null, heading: null, lines: [] }
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const match = !inFence && /^###\s+(.+?)\s*#*\s*$/.exec(line)
    if (match) {
      const kind = getSectionKind(match[1])
      if (kind || current.kind) {
        blocks.push(current)
        current = kind
          ? { kind, heading: match[1], lines: [] }
          : { kind: null, heading: null, lines: [line] }
        continue
      }
    }
    current.lines.push(line)
  }
  blocks.push(current)

  return blocks
    .map(({ lines, ...rest }) => ({ ...rest, body: lines.join('\n').trim() }))
    .filter((b) => b.kind || b.body)
}

// Subtopics of a topic that have a Markdown file (shown with a green "notes ready" dot).
export function readySubtopics(courseSlug, topic) {
  return topic.subtopics.filter((s) => hasContent(courseSlug, topic.slug, s.slug))
}
