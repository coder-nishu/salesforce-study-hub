// "Jump to" index — every place you can navigate to, by title (no page text).
// Built once from the catalog, course navigation, lab pages, scenarios and data model objects.

import {
  catalog,
  courses,
  subtopicPath,
  topicPath,
  vmDashboardPath,
  vmFindVolunteersPath,
  vmModelPath,
  vmModelViewPath,
  vmObjectPath,
  vmObjectsPath,
  vmPath,
  vmProcessesPath,
  vmRecordsPath,
  vmScenariosPath,
  vmUseCasePath,
} from '../data/navigation'
import { areasById, objects } from '../data/npc-vm'
import { useCases } from '../data/npc-vm/useCases'

function buildIndex() {
  const entries = []
  const add = (entry) => entries.push({ ...entry, haystack: `${entry.title} ${entry.subtitle ?? ''} ${entry.keywords ?? ''}`.toLowerCase() })

  for (const item of catalog) {
    add({ group: 'Courses', title: item.title, subtitle: item.kindLabel, path: item.path, kind: item.kind })
  }

  for (const course of courses) {
    for (const page of course.pages ?? []) {
      add({ group: course.title, title: page.title, subtitle: course.title, path: topicPath(course.slug, page.slug), kind: 'page' })
    }
    for (const topic of course.topics) {
      add({ group: course.title, title: topic.title, subtitle: `${course.title} › Domain`, path: topicPath(course.slug, topic.slug), kind: 'topic', keywords: topic.description })
      for (const sub of topic.subtopics) {
        add({ group: course.title, title: sub.title, subtitle: `${course.title} › ${topic.title}`, path: subtopicPath(course.slug, topic.slug, sub.slug), kind: 'page' })
      }
    }
  }

  const lab = catalog.find((c) => c.slug === 'vm')?.title ?? 'Lab'
  const labPages = [
    ['Lab home', vmPath, 'start overview reset'],
    ['Dashboard', vmDashboardPath, 'metrics coverage capacity'],
    ['Find Volunteers', vmFindVolunteersPath, 'matching match qualification availability'],
    ['Object Explorer', vmObjectsPath, 'objects schema'],
    ['Data Model', vmModelPath(), 'relationship map erd diagram'],
    ['Data Model — full model', vmModelViewPath('full'), 'all relationships chain'],
    ['Processes', vmProcessesPath, 'learning process flow'],
    ['Scenario Lab', vmScenariosPath, 'use cases exercises'],
    ['Volunteers', vmRecordsPath('Account', 'AccountType:Person Account'), 'person accounts people records'],
    ['Volunteer Initiatives', vmRecordsPath('VolunteerInitiative'), 'programs records'],
    ['Job Positions', vmRecordsPath('JobPosition'), 'jobs records'],
    ['Job Position Shifts', vmRecordsPath('JobPositionShift'), 'shifts schedule records'],
    ['Job Position Assignments', vmRecordsPath('JobPositionAssignment'), 'assignments records'],
  ]
  for (const [title, path, keywords] of labPages) add({ group: lab, title, subtitle: `${lab} › Page`, path, kind: 'lab-page', keywords })
  for (const u of useCases) add({ group: lab, title: u.title, subtitle: `${lab} › Scenario ${u.number}`, path: vmUseCasePath(u.id), kind: 'scenario', keywords: u.description })
  for (const o of objects) {
    add({ group: lab, title: o.label, subtitle: `${lab} › Object · ${areasById.get(o.area).label}`, path: vmObjectPath(o.apiName), kind: 'object', keywords: o.apiName })
  }
  return entries
}

let index = null

// Ranked search: title prefix > word prefix > title contains > subtitle / keywords.
export function searchJumpIndex(query, limit = 40) {
  index ??= buildIndex()
  const q = query.trim().toLowerCase()
  if (!q) return index.filter((e) => e.group === 'Courses' || e.kind === 'lab-page').slice(0, 12)
  const words = q.split(/\s+/)
  const scored = []
  for (const entry of index) {
    if (!words.every((w) => entry.haystack.includes(w))) continue
    const title = entry.title.toLowerCase()
    let score = 1
    if (title.startsWith(q)) score = 4
    else if (title.split(/[\s›—&-]+/).some((word) => word.startsWith(words[0]))) score = 3
    else if (title.includes(q)) score = 2
    scored.push({ entry, score })
  }
  scored.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length)
  return scored.slice(0, limit).map((s) => s.entry)
}
