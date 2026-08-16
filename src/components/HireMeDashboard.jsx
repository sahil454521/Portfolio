import { useState, useRef, useEffect } from 'react'
import { FaGithub, FaEnvelope } from 'react-icons/fa6'
import TargetCursorDemo from './TargetCursorDemo'

const QUICK_REPLIES = [
  {
    id: 'build',
    q: 'What do you build?',
    a: "AI tools and full-stack products — AiCompiler's inline code suggestions, and PPEMDD, a multimodal model that detects depression from text, EEG, wearable, and audio/video signals.",
  },
  {
    id: 'availability',
    q: 'Are you available?',
    a: 'Yes — open to AI/ML and full-stack internships, freelance builds, and research collaborations.',
  },
  {
    id: 'stack',
    q: "What's your stack?",
    a: 'React, Node.js, and Flask day to day, plus applied ML in Python — diffusion models, TF-IDF/LSA pipelines, and multi-head attention fusion.',
  },
  {
    id: 'reach',
    q: 'How do I reach you?',
    a: 'Email is fastest — sahilpathak2005@gmail.com. I read every message myself and reply within a day.',
  },
]

const INTRO = "Hey — I'm Sahil's inbox bot. Ask me something below, or type your own question."

function TypingBubble() {
  return (
    <div className="chat-bubble assistant chat-typing" aria-label="Typing">
      <span />
      <span />
      <span />
    </div>
  )
}

export default function HireMeDashboard() {
  const [thread, setThread] = useState([{ id: 'intro', role: 'assistant', text: INTRO }])
  const [asked, setAsked] = useState(() => new Set())
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [showEmailCta, setShowEmailCta] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [thread, typing])

  const pushReply = (userText, assistantText, revealCta = false) => {
    setThread((current) => [...current, { id: `u-${current.length}`, role: 'user', text: userText }])
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setThread((current) => [...current, { id: `a-${current.length}`, role: 'assistant', text: assistantText }])
      if (revealCta) setShowEmailCta(true)
    }, 620)
  }

  const handleQuickReply = (item) => {
    if (asked.has(item.id) || typing) return
    setAsked((current) => new Set(current).add(item.id))
    pushReply(item.q, item.a, item.id === 'reach')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = draft.trim()
    if (!value || typing) return
    setDraft('')
    pushReply(
      value,
      "Thanks for the detail — I read every message here personally. Quickest way to actually reach me is email, linked below.",
      true,
    )
  }

  const remaining = QUICK_REPLIES.filter((item) => !asked.has(item.id))

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
              <div className="hire-badge"><span className="core" />&nbsp;Available now</div>
              <h3>Let&apos;s build something</h3>
              <p>
                I build AI tools and full-stack products — from AiCompiler&apos;s inline code suggestions to
                PPEMDD&apos;s multimodal clinical models. I move fast without cutting corners on how things
                actually work under the hood.
              </p>
            </div>

            <div className="hire-box">
              <h4>What I&apos;m looking for</h4>
              <p>
                Internships, freelance builds, and research collaborations in AI/ML and full-stack
                development — especially where speed and correctness both matter.
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
                View my work
              </a>
              <a href="mailto:sahilpathak2005@gmail.com" className="contact-btn hire-btn">
                <FaEnvelope />
                Hire via email
              </a>
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <span className="chat-title"><span className="core" />&nbsp;Working chatbot</span>
              <span className="chat-sub mono">replies in ~1 day</span>
            </div>

            <div className="chat-thread" ref={threadRef}>
              {thread.map((message) => (
                <div key={message.id} className={`chat-bubble ${message.role}`}>
                  <span>{message.text}</span>
                </div>
              ))}
              {typing && <TypingBubble />}
              {showEmailCta && (
                <a
                  href={`mailto:sahilpathak2005@gmail.com?subject=${encodeURIComponent('Hey Sahil — from your portfolio')}`}
                  className="chat-cta"
                >
                  <FaEnvelope />
                  Email sahilpathak2005@gmail.com
                </a>
              )}
            </div>

            {remaining.length > 0 && (
              <div className="chat-quick">
                {remaining.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="chat-chip"
                    onClick={() => handleQuickReply(item)}
                    disabled={typing}
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            )}

            <form className="chat-form" onSubmit={handleSubmit}>
              <span className="chat-caret" aria-hidden="true" />
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Describe your project, internship, or collaboration idea..."
                aria-label="Ask a question"
                disabled={typing}
              />
              <button type="submit" className="chat-send" aria-label="Send" disabled={typing || !draft.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </TargetCursorDemo>
    </section>
  )
}