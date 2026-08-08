import { FaGithub, FaEnvelope, FaArrowUpRightFromSquare } from 'react-icons/fa6'
import TargetCursorDemo from './TargetCursorDemo'

const messages = [
  {
    role: 'system',
    text: 'User Dashboard',
  },
  {
    role: 'assistant',
    text: 'I build AI tools, polished frontend systems, and full-stack products that feel production-ready.',
  },
  {
    role: 'assistant',
    text: 'Open for internships, freelance work, and collaborations where speed and clarity matter.',
  },
]

export default function HireMeDashboard() {
  return (
    <section id="connect" className="section reveal connect-section">
      <div className="section-head">
        <div className="path mono">~/hire-me.dashboard</div>
        <h2 className="title">Hire me</h2>
      </div>

      <TargetCursorDemo className="hire-shell">
        <div className="hire-grid">
          <div className="hire-panel">
            <div className="hire-hero">
              <div className="hire-badge">User Dashboard</div>
              <h3>Component In Development</h3>
              <p>
                I&apos;m currently working on creating sharp, responsive portfolio and AI product experiences for brands,
                startups, and founders who want something that ships cleanly.
              </p>
            </div>

            <div className="hire-box">
              <h4>Want to contribute or collaborate?</h4>
              <p>
                If you&apos;re looking for a developer who can move between UI polish, backend logic, and AI workflows,
                I&apos;d be a solid fit.
              </p>
            </div>

            <div className="hire-actions">
              <a
                href="https://github.com/sahil454521"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn hire-btn"
              >
                <FaGithub />
                Contribute on GitHub
              </a>
              <a href="mailto:sahilpathak2005@gmail.com" className="contact-btn hire-btn">
                <FaEnvelope />
                Hire via email
              </a>
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <span className="chat-title">Working chatbot</span>
              <FaArrowUpRightFromSquare />
            </div>

            <div className="chat-thread">
              {messages.map((message) => (
                <div key={message.text} className={`chat-bubble ${message.role}`}>
                  <span>{message.text}</span>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <span className="chat-caret" />
              Describe your project, internship, or collaboration idea...
            </div>
          </div>
        </div>
      </TargetCursorDemo>
    </section>
  )
}