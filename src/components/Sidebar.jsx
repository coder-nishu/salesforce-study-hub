import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  catalog,
  catalogPlaceholder,
  coursePath,
  currentCatalogEntry,
  getCourse,
  parsePath,
  topicPath,
} from '../data/navigation'
import CourseSwitcher, { CourseIcon } from './CourseSwitcher'
import SidebarTopic from './SidebarTopic'
import VmSidebar from './vm/VmSidebar'

// Topic → subtopic tree for a certification course (e.g. Salesforce Administrator).
function CourseNav({ course, sectionSlug }) {
  const activeTopic = course.topics.some((t) => t.slug === sectionSlug) ? sectionSlug : null

  // Open/closed state per topic, kept in memory for this React session only.
  const [openTopics, setOpenTopics] = useState(() => (activeTopic ? { [activeTopic]: true } : {}))

  // Auto-expand the domain containing the current page when navigating into it.
  const [prevActiveTopic, setPrevActiveTopic] = useState(activeTopic)
  if (activeTopic !== prevActiveTopic) {
    setPrevActiveTopic(activeTopic)
    if (activeTopic) setOpenTopics((prev) => ({ ...prev, [activeTopic]: true }))
  }

  const toggleTopic = (slug) => setOpenTopics((prev) => ({ ...prev, [slug]: !prev[slug] }))

  return (
    <>
      <div className="sidebar-section-label">Start</div>
      <ul className="sidebar-list">
        <li className="sidebar-topic">
          <div className="sidebar-topic-row">
            <NavLink to={coursePath(course.slug)} end className={({ isActive }) => `sidebar-topic-link${isActive ? ' is-current' : ''}`}>
              Course overview
            </NavLink>
          </div>
        </li>
        {course.pages?.map((page) => (
          <li key={page.slug} className="sidebar-topic">
            <div className="sidebar-topic-row">
              <NavLink to={topicPath(course.slug, page.slug)} end className={({ isActive }) => `sidebar-topic-link${isActive ? ' is-current' : ''}`}>
                {page.title}
              </NavLink>
            </div>
          </li>
        ))}
      </ul>

      <div className="sidebar-section-label">Domains</div>
      <ul className="sidebar-list">
        {course.topics.map((topic) => (
          <SidebarTopic
            key={topic.slug}
            courseSlug={course.slug}
            topic={topic}
            isOpen={Boolean(openTopics[topic.slug])}
            isActive={topic.slug === activeTopic}
            onToggle={() => toggleTopic(topic.slug)}
          />
        ))}
      </ul>
    </>
  )
}

// On pages that belong to no course (the catalog, 404): the list of courses.
function CatalogNav() {
  return (
    <>
      <div className="sidebar-section-label">Courses</div>
      <ul className="sidebar-list sidebar-catalog">
        {catalog.map((entry) => (
          <li key={entry.slug}>
            <Link to={entry.path} className="sidebar-catalog-link">
              <CourseIcon kind={entry.kind} />
              <span>
                <span className="sidebar-catalog-title">{entry.title}</span>
                <span className="sidebar-catalog-kind">{entry.kindLabel}</span>
              </span>
            </Link>
          </li>
        ))}
        <li className="sidebar-catalog-soon">＋ {catalogPlaceholder.title}</li>
      </ul>
    </>
  )
}

export default function Sidebar({ isOpen }) {
  const { pathname } = useLocation()
  const { courseSlug, sectionSlug } = parsePath(pathname)
  const entry = currentCatalogEntry(pathname)
  const course = entry?.kind === 'course' ? getCourse(entry.slug) : null

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-label="Site navigation">
      <nav className="sidebar-inner" aria-label={entry ? `${entry.title} navigation` : 'Courses'}>
        <div className="sidebar-top">
          {pathname !== '/' && (
            <Link to="/" className="sidebar-all">
              <span aria-hidden="true">←</span> All courses
            </Link>
          )}
          <CourseSwitcher variant="sidebar" />
        </div>

        {entry?.slug === 'vm' && <VmSidebar />}
        {course && <CourseNav key={course.slug} course={course} sectionSlug={courseSlug === course.slug ? sectionSlug : null} />}
        {!entry && <CatalogNav />}
      </nav>
    </aside>
  )
}
