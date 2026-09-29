// Central navigation structure: Course → Topic (domain) → Subtopic.
// Used by the sidebar, course overview, topic pages, breadcrumbs and routing helpers.
// Do not duplicate this data elsewhere.

export const courses = [
  {
    slug: 'salesforce-admin',
    title: 'Salesforce Administrator',
    description:
      'Build the knowledge you need to configure, manage, automate, and secure Salesforce.',
    exam: { questions: 60, minutes: 65 },
    // Standalone pages that sit directly under the course (no subtopics).
    pages: [{ slug: 'introduction', title: 'Introduction' }],
    topics: [
      {
        slug: 'configuration-setup',
        title: 'Configuration & Setup',
        description:
          'Manage organization settings, users, licenses, and configuration.',
        subtopics: [
          { slug: 'company-settings', title: 'Company Settings' },
          { slug: 'users-and-licenses', title: 'Users & Licenses' },
          { slug: 'business-hours', title: 'Business Hours' },
          { slug: 'fiscal-year', title: 'Fiscal Year' },
        ],
      },
      {
        slug: 'object-manager',
        title: 'Object Manager',
        description:
          'Understand objects, fields, record types, layouts, and formulas.',
        subtopics: [
          { slug: 'fields', title: 'Fields' },
          { slug: 'record-types', title: 'Record Types' },
          { slug: 'page-layouts', title: 'Page Layouts' },
          { slug: 'formula-fields', title: 'Formula Fields' },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        description:
          'Learn profiles, permission sets, roles, sharing, and access control.',
        summary: 'Understand how Salesforce controls access to data.',
        subtopics: [
          { slug: 'profiles', title: 'Profiles' },
          { slug: 'permission-sets', title: 'Permission Sets' },
          { slug: 'role-hierarchy', title: 'Role Hierarchy' },
          { slug: 'organization-wide-defaults', title: 'Organization-Wide Defaults' },
          { slug: 'sharing-rules', title: 'Sharing Rules' },
        ],
      },
      {
        slug: 'data-management',
        title: 'Data Management',
        description:
          'Import, export, update, transfer, delete, and maintain Salesforce data.',
        subtopics: [
          { slug: 'data-import-wizard', title: 'Data Import Wizard' },
          { slug: 'data-loader', title: 'Data Loader' },
          { slug: 'record-ids', title: 'Record IDs' },
          { slug: 'external-ids', title: 'External IDs' },
          { slug: 'duplicate-management', title: 'Duplicate Management' },
          { slug: 'data-storage', title: 'Data Storage' },
        ],
      },
      {
        slug: 'automation',
        title: 'Automation',
        description:
          'Learn Flow Builder, Validation Rules, and Approval Processes.',
        subtopics: [
          { slug: 'flows', title: 'Flow Builder' },
          { slug: 'validation-rules', title: 'Validation Rules' },
          { slug: 'approval-processes', title: 'Approval Processes' },
        ],
      },
      {
        slug: 'agentforce',
        title: 'Agentforce',
        description:
          'Learn the core concepts and configuration of Agentforce.',
        subtopics: [
          { slug: 'introduction', title: 'Introduction' },
          { slug: 'topics', title: 'Topics' },
          { slug: 'actions', title: 'Actions' },
        ],
      },
      {
        slug: 'sales',
        title: 'Sales',
        description: 'Leads, opportunities, and the core Sales Cloud setup.',
        subtopics: [],
      },
      {
        slug: 'service',
        title: 'Service',
        description: 'Cases, queues, and the core Service Cloud setup.',
        subtopics: [],
      },
      {
        slug: 'reports-dashboards',
        title: 'Reports & Dashboards',
        description: 'Report types, report formats, and dashboard components.',
        subtopics: [],
      },
      {
        slug: 'marketing',
        title: 'Marketing',
        description: 'Campaigns, campaign members, and marketing basics.',
        subtopics: [],
      },
    ],
  },
]

export const DEFAULT_COURSE_SLUG = 'salesforce-admin'

// ---------- Lookup helpers ----------

export function getCourse(courseSlug) {
  return courses.find((c) => c.slug === courseSlug)
}

export function getCoursePage(course, pageSlug) {
  return course?.pages?.find((p) => p.slug === pageSlug)
}

export function getTopic(course, topicSlug) {
  return course?.topics.find((t) => t.slug === topicSlug)
}

export function getSubtopic(topic, subtopicSlug) {
  return topic?.subtopics.find((s) => s.slug === subtopicSlug)
}

// ---------- Path helpers ----------

export function coursePath(courseSlug) {
  return `/${courseSlug}`
}

export function topicPath(courseSlug, topicSlug) {
  return `/${courseSlug}/${topicSlug}`
}

export function subtopicPath(courseSlug, topicSlug, subtopicSlug) {
  return `/${courseSlug}/${topicSlug}/${subtopicSlug}`
}

// Returns a flat, ordered reading sequence for a course.
// Used later for dynamic previous/next navigation.
export function getReadingOrder(course) {
  if (!course) return []
  const items = []
  for (const page of course.pages ?? []) {
    items.push({ title: page.title, path: topicPath(course.slug, page.slug) })
  }
  for (const topic of course.topics) {
    items.push({ title: topic.title, path: topicPath(course.slug, topic.slug) })
    for (const sub of topic.subtopics) {
      items.push({
        title: sub.title,
        path: subtopicPath(course.slug, topic.slug, sub.slug),
      })
    }
  }
  return items
}

export function getPrevNext(course, path) {
  const order = getReadingOrder(course)
  const index = order.findIndex((item) => item.path === path)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: order[index - 1] ?? null,
    next: order[index + 1] ?? null,
  }
}

// Splits a pathname into its hierarchy slugs.
// Used by layout-level components (header, sidebar) that sit above the matched route.
export function parsePath(pathname) {
  const [courseSlug, sectionSlug, subtopicSlug] = pathname.split('/').filter(Boolean)
  return { courseSlug, sectionSlug, subtopicSlug }
}

// ---------- Labs ----------
// Labs are courses with their own screens instead of topic → subtopic pages.
// Their data lives with the lab (e.g. src/data/npc-vm/); only the entry point is here.

export const labs = [
  {
    slug: 'vm',
    title: 'NPC Volunteer Management Lab',
    tag: 'Data model lab',
    description:
      'Explore the Nonprofit Cloud Volunteer Management data model — objects, relationships, and how the areas connect.',
  },
]

export function getLab(slug) {
  return labs.find((l) => l.slug === slug)
}

export const vmPath = '/vm'
export const vmObjectsPath = '/vm/objects'

export function vmObjectPath(apiName) {
  return `/vm/objects/${apiName}`
}

export function vmModelPath(focus) {
  return focus ? `/vm/model?focus=${encodeURIComponent(focus)}` : '/vm/model'
}

export const vmDashboardPath = '/vm/dashboard'
export const vmFindVolunteersPath = '/vm/find-volunteers'
export const vmProcessesPath = '/vm/processes'
export const vmScenariosPath = '/vm/scenarios'

export function vmRecordsPath(apiName, filter) {
  const base = `/vm/objects/${apiName}/records`
  return filter ? `${base}?filter=${encodeURIComponent(filter)}` : base
}

export function vmRecordPath(apiName, recordId) {
  return `/vm/objects/${apiName}/records/${recordId}`
}

// prefill: { FieldApiName: value } — pre-sets fields, e.g. the parent from a related list.
export function vmNewRecordPath(apiName, prefill) {
  const base = `/vm/objects/${apiName}/records/new`
  if (!prefill || !Object.keys(prefill).length) return base
  return `${base}?${new URLSearchParams(prefill).toString()}`
}

export function vmEditRecordPath(apiName, recordId) {
  return `/vm/objects/${apiName}/records/${recordId}/edit`
}

export function vmUseCasePath(useCaseId) {
  return `/vm/use-cases/${useCaseId}`
}

// Data Model page views: 'focus' (default), 'area', 'full', 'record'.
export function vmModelViewPath(view, params = {}) {
  return `/vm/model?${new URLSearchParams({ view, ...params }).toString()}`
}
