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
        // A domain can group its subtopics into modules (the course material's own units).
        // Subtopics without a `module` are listed first, under "Topics".
        modules: [
          {
            id: 'setup-iii',
            title: 'Module 3 — Users, Permissions & Security',
            description: 'Users and licenses, profiles and permission sets, login security, and record & field access as one connected model.',
          },
        ],
        subtopics: [
          { slug: 'company-settings', title: 'Company Settings' },
          { slug: 'business-hours', title: 'Business Hours' },
          { slug: 'fiscal-year', title: 'Fiscal Year' },
          { slug: 'setup-iii-overview', title: 'Module 3 Overview: The Security Model', module: 'setup-iii' },
          { slug: 'users-and-licenses', title: 'Users & Licenses', module: 'setup-iii' },
          { slug: 'user-maintenance', title: 'User Maintenance', module: 'setup-iii' },
          { slug: 'profiles-and-object-permissions', title: 'Profiles & Object Permissions', module: 'setup-iii' },
          { slug: 'permission-sets-and-groups', title: 'Permission Sets, Groups & Muting', module: 'setup-iii' },
          { slug: 'organization-security', title: 'Organization Security Controls', module: 'setup-iii' },
          { slug: 'record-and-field-access', title: 'Record & Field Access', module: 'setup-iii' },
          { slug: 'setup-iii-scenarios', title: 'Scenarios & Troubleshooting', module: 'setup-iii' },
          { slug: 'setup-iii-revision', title: 'Revision & Exam Keywords', module: 'setup-iii' },
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
          // seeAlso: where this topic is already covered in another domain's module.
          { slug: 'profiles', title: 'Profiles', seeAlso: [{ label: 'Profiles & Object Permissions (Configuration & Setup III)', path: '/salesforce-admin/configuration-setup/profiles-and-object-permissions' }] },
          { slug: 'permission-sets', title: 'Permission Sets', seeAlso: [{ label: 'Permission Sets, Groups & Muting (Configuration & Setup III)', path: '/salesforce-admin/configuration-setup/permission-sets-and-groups' }] },
          { slug: 'role-hierarchy', title: 'Role Hierarchy', seeAlso: [{ label: 'Record & Field Access (Configuration & Setup III)', path: '/salesforce-admin/configuration-setup/record-and-field-access' }] },
          { slug: 'organization-wide-defaults', title: 'Organization-Wide Defaults', seeAlso: [{ label: 'Record & Field Access (Configuration & Setup III)', path: '/salesforce-admin/configuration-setup/record-and-field-access' }] },
          { slug: 'sharing-rules', title: 'Sharing Rules', seeAlso: [{ label: 'Record & Field Access (Configuration & Setup III)', path: '/salesforce-admin/configuration-setup/record-and-field-access' }] },
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

// Subtopics grouped by module, in display order: ungrouped topics first, then each module.
// Returns [{ module: { id, title, description } | null, subtopics: [...] }] (empty groups dropped).
export function groupSubtopics(topic) {
  const groups = [{ module: null, subtopics: topic.subtopics.filter((s) => !s.module) }]
  for (const module of topic.modules ?? []) {
    groups.push({ module, subtopics: topic.subtopics.filter((s) => s.module === module.id) })
  }
  return groups.filter((g) => g.subtopics.length)
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

// ---------- Course catalog ----------
// Every course and lab on the site, in display order. The header switcher, the sidebar,
// the home page and "Jump to" all read this list — add a future course here.

export const catalog = [
  {
    slug: 'salesforce-admin',
    kind: 'course',
    kindLabel: 'Certification course',
    title: 'Salesforce Administrator',
    tagline: 'Structured notes, scenarios, exam shortcuts and revision for the Admin certification.',
    path: '/salesforce-admin',
    stats: ['10 domains', '60 questions · 65 minutes'],
  },
  {
    slug: 'vm',
    kind: 'lab',
    kindLabel: 'Interactive lab',
    title: 'NPC Volunteer Management Lab',
    tagline: 'A small Nonprofit Cloud org you can experiment with: create volunteers, match them to shifts, see why.',
    path: '/vm',
    stats: ['35 objects', '12 scenarios'],
  },
]

export const catalogPlaceholder = {
  title: 'More courses coming',
  text: 'New Salesforce courses and labs will appear here as they’re added.',
}

// The catalog entry the current page belongs to, or null (e.g. the home page).
export function currentCatalogEntry(pathname) {
  const slug = pathname.split('/').filter(Boolean)[0]
  return catalog.find((entry) => entry.slug === slug) ?? null
}
