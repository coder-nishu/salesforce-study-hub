import { Link } from 'react-router-dom'
import { coursePath } from '../data/navigation'

// Used for certification courses and for labs (pass `to`, `tag` and `meta`).
export default function CourseCard({ course, to, tag = 'Certification preparation', meta }) {
  return (
    <Link to={to ?? coursePath(course.slug)} className="course-card">
      <div className="course-card-tag">{tag}</div>
      <h2 className="course-card-title">{course.title}</h2>
      {meta && <div className="course-card-meta">{meta}</div>}
      {course.exam && (
        <div className="course-card-meta">
          {course.exam.questions} questions · {course.exam.minutes} minutes
        </div>
      )}
      <p className="course-card-desc">{course.description}</p>
      <span className="course-card-cta">Start Learning →</span>
    </Link>
  )
}
