import CourseCard from '../components/CourseCard'
import { courses, labs, vmPath } from '../data/navigation'
import { totals as vmTotals } from '../data/npc-vm'

export default function Home() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Salesforce Study Hub</h1>
        <p className="page-subtitle">
          Learn Salesforce Administration through structured notes, scenarios,
          shortcuts, and practice exams.
        </p>
      </header>

      <section>
        <h2 className="section-label">Courses</h2>
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
          {labs.map((lab) => (
            <CourseCard
              key={lab.slug}
              course={lab}
              to={vmPath}
              tag={lab.tag}
              meta={`${vmTotals.objects} objects · ${vmTotals.relationships} relationships`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
