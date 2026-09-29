const SOURCES = {
  official: { label: 'Official', title: 'From the Salesforce object reference or Help' },
  erd: { label: 'ERD', title: 'From your ERD (docs/vm-erd.png)' },
  'assumed-standard': { label: 'Standard', title: 'Well-known standard field, not re-checked for this lab' },
  course: { label: 'Course', title: 'From your course documents — illustrative, not official' },
  learning: { label: 'Simplified', title: 'Simulator-only simplification' },
  simplification: { label: 'Simplified', title: 'Learning simplification — not documented Salesforce behaviour' },
}

export default function SourceBadge({ source }) {
  const info = SOURCES[source]
  if (!info) return null
  return (
    <span className={`vm-source vm-source-${source}`} title={info.title}>
      {info.label}
    </span>
  )
}
