import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import ComingSoon from './components/ComingSoon'
import ContentPage from './components/ContentPage'
import Layout from './components/Layout'
import {
  coursePath,
  getCourse,
  getCoursePage,
  getSubtopic,
  getTopic,
} from './data/navigation'
import { getContentPage } from './lib/content'
import CourseOverview from './pages/CourseOverview'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import SubtopicPage from './pages/SubtopicPage'
import TopicPage from './pages/TopicPage'
import VmHome from './pages/vm/VmHome'
import VmModel from './pages/vm/VmModel'
import VmObjectDetails from './pages/vm/VmObjectDetails'
import VmObjectExplorer from './pages/vm/VmObjectExplorer'

function CourseRoute() {
  const course = getCourse(useParams().courseSlug)
  if (!course) return <NotFound />
  return <CourseOverview course={course} />
}

// /:courseSlug/:sectionSlug — either a standalone course page or a topic.
function SectionRoute() {
  const { courseSlug, sectionSlug } = useParams()
  const course = getCourse(courseSlug)
  if (!course) return <NotFound />

  const page = getCoursePage(course, sectionSlug)
  if (page) {
    // Course-level page: src/content/<course>/<page>.md
    const md = getContentPage(course.slug, page.slug)
    const meta = md?.frontmatter ?? {}
    return (
      <ContentPage
        course={course}
        breadcrumbs={[
          { label: course.title, to: coursePath(course.slug) },
          { label: page.title },
        ]}
        title={meta.title ?? page.title}
        summary={meta.summary}
        tags={meta.tags}
        content={md?.content}
      >
        <ComingSoon title={page.title} />
      </ContentPage>
    )
  }

  const topic = getTopic(course, sectionSlug)
  if (topic) return <TopicPage course={course} topic={topic} />

  return <NotFound />
}

function SubtopicRoute() {
  const { courseSlug, sectionSlug, subtopicSlug } = useParams()
  const course = getCourse(courseSlug)
  const topic = getTopic(course, sectionSlug)
  const subtopic = getSubtopic(topic, subtopicSlug)
  if (!subtopic) return <NotFound />
  return <SubtopicPage course={course} topic={topic} subtopic={subtopic} />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {/* NPC Volunteer Management Lab — static "vm" segments outrank :courseSlug */}
          <Route path="vm" element={<VmHome />} />
          <Route path="vm/objects" element={<VmObjectExplorer />} />
          <Route path="vm/objects/:apiName" element={<VmObjectDetails />} />
          <Route path="vm/model" element={<VmModel />} />
          <Route path=":courseSlug" element={<CourseRoute />} />
          <Route path=":courseSlug/:sectionSlug" element={<SectionRoute />} />
          <Route
            path=":courseSlug/:sectionSlug/:subtopicSlug"
            element={<SubtopicRoute />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
