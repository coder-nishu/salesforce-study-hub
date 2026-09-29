import { NavLink } from 'react-router-dom'
import { subtopicPath, topicPath } from '../data/navigation'

export default function SidebarTopic({ courseSlug, topic, isOpen, isActive, onToggle }) {
  const hasSubtopics = topic.subtopics.length > 0
  const listId = `sidebar-${topic.slug}`

  return (
    <li className={`sidebar-topic${isActive ? ' is-active' : ''}`}>
      <div className="sidebar-topic-row">
        <NavLink
          to={topicPath(courseSlug, topic.slug)}
          end
          className={({ isActive: exact }) =>
            `sidebar-topic-link${exact ? ' is-current' : ''}`
          }
        >
          {topic.title}
        </NavLink>
        {hasSubtopics && (
          <button
            type="button"
            className={`sidebar-toggle${isOpen ? ' is-open' : ''}`}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${topic.title}`}
            onClick={onToggle}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {hasSubtopics && isOpen && (
        <ul id={listId} className="sidebar-subtopics">
          {topic.subtopics.map((sub) => (
            <li key={sub.slug}>
              <NavLink
                to={subtopicPath(courseSlug, topic.slug, sub.slug)}
                className={({ isActive: current }) =>
                  `sidebar-subtopic-link${current ? ' is-current' : ''}`
                }
              >
                {sub.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
