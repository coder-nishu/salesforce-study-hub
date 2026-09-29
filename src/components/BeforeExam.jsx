import Markdown from './Markdown'

export default function BeforeExam({ heading, id, body }) {
  return (
    <section id={id} className="before-exam">
      <header className="before-exam-header">
        <h2>{heading}</h2>
        <p>Read this 5 minutes before the exam.</p>
      </header>
      <Markdown>{body}</Markdown>
    </section>
  )
}
