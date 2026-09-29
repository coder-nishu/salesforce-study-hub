import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  DEFAULT_COURSE_SLUG,
  coursePath,
  getCourse,
  parsePath,
  topicPath,
} from '../data/navigation'
import SidebarTopic from './SidebarTopic'
import VmSidebar from './vm/VmSidebar'

export default function Sidebar({ isOpen }) {
  const { courseSlug, sectionSlug } = parsePath(useLocation().pathname)
  const course = getCourse(courseSlug) ?? getCourse(DEFAULT_COURSE_SLUG)
  const activeTopic = course.topics.some((t) => t.slug === sectionSlug)
    ? sectionSlug
    : null

  // Open/closed state per topic, kept in memory for this React session only.
  const [openTopics, setOpenTopics] = useState(() =>
    activeTopic ? { [activeTopic]: true } : {},
  )

  // Auto-expand the domain containing the current page when navigating into it.
  const [prevActiveTopic, setPrevActiveTopic] = useState(activeTopic)
  if (activeTopic !== prevActiveTopic) {
    setPrevActiveTopic(activeTopic)
    if (activeTopic) setOpenTopics((prev) => ({ ...prev, [activeTopic]: true }))
  }

  const toggleTopic = (slug) =>
    setOpenTopics((prev) => ({ ...prev, [slug]: !prev[slug] }))

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-label="Course navigation">
      {courseSlug === 'vm' ? <VmSidebar /> : (
      <nav className="sidebar-inner">
        <div className="sidebar-section-label">Course</div>
        <NavLink
          to={coursePath(course.slug)}
          end
          className={({ isActive }) => `sidebar-course${isActive ? ' is-current' : ''}`}
        >
          {course.title}
        </NavLink>

        <div className="sidebar-section-label">{course.title}</div>

        <ul className="sidebar-list">
          {course.pages?.map((page) => (
            <li key={page.slug} className="sidebar-topic">
              <div className="sidebar-topic-row">
                <NavLink
                  to={topicPath(course.slug, page.slug)}
                  end
                  className={({ isActive }) =>
                    `sidebar-topic-link${isActive ? ' is-current' : ''}`
                  }
                >
                  {page.title}
                </NavLink>
              </div>
            </li>
          ))}

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
      </nav>
      )}
    </aside>
  )
}
