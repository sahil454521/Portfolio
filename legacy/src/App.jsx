import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import SkillMarquee from './components/SkillMarquee'
import PointerHighlightDemo from './components/PointerHighlightDemo'
import TargetCursorDemo from './components/TargetCursorDemo'
import HireMeDashboard from './components/HireMeDashboard'
import FootstepsAnimation from './components/FootstepsAnimation'
import PokemonBattleModal from './components/PokemonBattleModal'

const sections = ['about', 'research', 'projects', 'experience', 'skills', 'connect', 'contact']

const bootLines = [
  { tag: 'Name', val: 'Sahil Pathak', cls: 'ok' },
  { tag: 'Role', val: 'AI/ML Engineer · Full-Stack Developer', cls: 'val' },
  { tag: 'Building', val: 'AiCompiler — AI code editor', cls: 'val' },
  { tag: 'Research', val: 'PPEMDD — multimodal depression detection', cls: 'val' },
  { tag: 'Based in', val: 'India', cls: 'val' },
]

function Icon({ children, className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">{children}</svg>
}

function App() {
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('about')
  const [revealedSections, setRevealedSections] = useState(() => new Set(['about']))
  const [bootRows, setBootRows] = useState([])
  const [arcadeOpen, setArcadeOpen] = useState(false)
  const [arcadeMode, setArcadeMode] = useState('choice')

  useEffect(() => {
    const stored = localStorage.getItem('sahil-theme')
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    const nextTheme = stored || (prefersLight ? 'light' : 'dark')
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }, [])

  useEffect(() => {
    document.title = 'Sahil Pathak — AI/ML Engineer & Full-Stack Developer'
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', 'Portfolio of Sahil Pathak — AI/ML engineer and full-stack developer building intelligent systems.')
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealedSections((current) => {
              const next = new Set(current)
              next.add(entry.target.id)
              return next
            })
          }
        })
      },
      { threshold: 0.12 },
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) revealObserver.observe(element)
    })

    return () => revealObserver.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    const runBoot = async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduced) {
        setBootRows(bootLines.map((line) => line.val))
        return
      }

      const nextRows = []
      for (const line of bootLines) {
        let text = ''
        for (const char of line.val) {
          if (cancelled) return
          text += char
          setBootRows([...nextRows, text])
          await wait(7)
        }
        nextRows.push(line.val)
        setBootRows([...nextRows])
        await wait(90)
      }
    }

    runBoot()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const cursorTimer = window.setInterval(() => {}, 1000)
    return () => window.clearInterval(cursorTimer)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('sahil-theme', nextTheme)
  }

  return (
    <>
      <FootstepsAnimation />
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><span className="core" /> Sahil Pathak</div>
          <nav className="tabs" aria-label="Primary">
            <a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a>
            <a href="#research" className={activeSection === 'research' ? 'active' : ''}>Research</a>
            <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
            <a href="#experience" className={activeSection === 'experience' ? 'active' : ''}>Experience</a>
            <a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
            <a href="#connect" className={activeSection === 'connect' ? 'active' : ''}>Hire me</a>
            <a
              href="#resume"
              onClick={(e) => {
                e.preventDefault()
                setArcadeMode('choice')
                setArcadeOpen(true)
              }}
              style={{ color: 'var(--accent)', fontWeight: 600 }}
            >
              Resume 🕹️
            </a>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Contact</a>
          </nav>
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle color theme" onClick={toggleTheme}>
            <svg className="icon-sun" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg className="icon-moon" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
          </button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="eyebrow"><span className="core" /> Open to AI/ML &amp; full-stack roles</div>
            <h1 className="name">Sahil Pathak</h1>
            <p className="role-line">AI/ML engineer and full-stack developer studying CSE at DY Patil International University, with an AI &amp; Data Science specialization at IIT Guwahati. I build systems that reason about data — from <b>autocomplete models</b> to <b>clinical detection frameworks</b>.</p>
          </motion.div>
          <SkillMarquee />

          <div className="console" role="img" aria-label="System profile summary">
            <div className="console-titlebar"><span>Profile</span><span className="core" /></div>
            <div className="console-body" id="bootArea">
              {bootLines.map((line, index) => (
                <div className="row" key={line.tag}>
                  <span className="tag">{line.tag}</span>
                  <span className={line.cls}>{bootRows[index] || ''}</span>
                </div>
              ))}
              <div className="row"><span className="tag">&gt;</span><span className="cursor-blink" /></div>
            </div>
            <div className="statusbar">
              <a href="https://github.com/sahil454521" target="_blank" rel="noopener noreferrer"><Icon><path d="M12 2C6.48 2 2 6.48 2 12a10 10 0 0 0 6.84 9.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/></Icon>github/sahil454521</a>
              <div className="sep"><a href="mailto:sahilpathak2005@gmail.com"><Icon><path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/></Icon>email</a></div>
              <div className="sep">
                <a
                  href="#resume"
                  onClick={(e) => {
                    e.preventDefault()
                    setArcadeMode('choice')
                    setArcadeOpen(true)
                  }}
                  style={{ color: 'var(--accent)' }}
                >
                  <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Icon>resume / arcade 🕹️
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={`section reveal ${revealedSections.has('about') ? 'in' : ''}`} id="about">
          <div className="section-head">
            <div className="path fineline"><span className="dot" />&nbsp;About</div>
            <h2 className="title">About</h2>
          </div>
          <div className="about-grid">
            <div>
              <p>I like building software that reasons — right now that spans two directions: <b>AiCompiler</b>, an AI-assisted code editor with inline suggestions you accept with a single tap of Tab, and <b>PPEMDD</b>, a multimodal deep learning framework for detecting depression from text, EEG, wearable, and audio/video signals.</p>
              <p>Across both, I work full-stack — <b>React, Node.js, Flask</b> — and dig into applied ML, from fine-tuning diffusion models for image generation to designing multi-task clinical prediction heads.</p>
              <p>I've competed in Smart India Hackathon and SharkIndia, contributed to a FOSS hackathon project, and completed Deloitte Australia's technology consulting simulation. Off the clock: guitar, chess, gym, cooking, reading.</p>
            </div>
            <div className="edu-list">
              <div className="edu-item"><div className="school">DY Patil International University</div><div className="deg">B.Tech, Computer Science &amp; Engineering</div><div className="date mono">Aug 2023 — Aug 2027</div></div>
              <div className="edu-item"><div className="school">IIT Guwahati</div><div className="deg">Specialization — AI &amp; Data Science</div><div className="date mono">Aug 2023 — Aug 2027</div></div>
            </div>
          </div>
        </section>

        <section className={`section reveal ${revealedSections.has('research') ? 'in' : ''}`} id="research">
          <div className="section-head">
            <div className="path fineline"><span className="dot" />&nbsp;Research</div>
            <h2 className="title">Research</h2>
          </div>
          <div className="research-card">
            <div className="research-head">
              <span className="research-tag">IEEE format · Sole author</span>
              <div className="research-title">PPEMDD — Multimodal Depression Detection Framework</div>
            </div>
            <div className="research-body">
              <p>A deep learning framework that fuses <b>text, EEG, wearable, and audio/video</b> signals through a Dynamic Gating Network and Multi-Head Cross-Attention layer, producing three simultaneous clinical outputs: binary depression classification, PHQ-9 severity regression, and DSM-5 multi-label symptom recognition.</p>
              <div className="stat-grid">
                <div className="stat"><div className="num">91.24%</div><div className="lab">Accuracy</div></div>
                <div className="stat"><div className="num">0.7809</div><div className="lab">F1-Score</div></div>
                <div className="stat"><div className="num">0.7697</div><div className="lab">Precision</div></div>
                <div className="stat"><div className="num">0.7923</div><div className="lab">Recall</div></div>
              </div>
              <p style={{ marginTop: '-8px', fontSize: '12.5px', color: 'var(--text-faint)' }}>Reported on a genuinely held-out test partition (n = 2,250), threshold fixed on a separate validation fold — no leakage into the reported figure.</p>
              <ul>
                <li>Availability-aware fusion that degrades gracefully instead of requiring every modality to be present.</li>
                <li>TF-IDF-weighted Latent Semantic Analysis text pathway, shown to improve class separability over static word-vector averaging.</li>
                <li>A rule-based clinical safety gate: predictions are never silently de-escalated when a severity indicator disagrees with the model.</li>
                <li>Modular, openly released implementation that separates validated components from scaffolded future work.</li>
              </ul>
              <div className="integrity-note"><p><b>Disclosed by design.</b> The paper reports two of its own negative findings — an evaluation-leakage risk found during development, and a differential-privacy noise-scaling defect in the federated-learning extension — rather than presenting unvalidated modules as finished results.</p></div>
            </div>
          </div>
        </section>

        <section className={`section reveal ${revealedSections.has('projects') ? 'in' : ''}`} id="projects">
          <div className="section-head">
            <div className="path fineline"><span className="dot" />&nbsp;Projects</div>
            <h2 className="title">Projects</h2>
          </div>
          <PointerHighlightDemo className="projects-highlight">
            <div className="project-card">
              <div className="pc-head"><div className="pc-name">AiCompiler <span className="pc-id">— AI code editor</span></div><a className="pc-link" href="https://github.com/sahil454521/AiCompiler" target="_blank" rel="noopener noreferrer">source<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7M7 7h10v10"/></svg></a></div>
              <div className="pc-body"><ul><li>Inline AI code suggestions in the style of VS Code — shown in a muted ghost tone and accepted with a single Tab press.</li><li>Real-time, user-authenticated platform built on Clerk auth and Convex DB.</li><li>Trained on a growing dataset of real coding errors to keep suggestion quality improving over time.</li></ul><div className="pills"><span className="pill">Node.js</span><span className="pill">Convex DB</span><span className="pill">Clerk Auth</span><span className="pill">Custom ML Model</span></div></div>
            </div>
            <div className="project-card">
              <div className="pc-head"><div className="pc-name">AI Image Generator</div></div>
              <div className="pc-body"><ul><li>An AI-powered image generation pipeline built on Hugging Face's Diffusers library.</li><li>Fine-tuned pretrained transformer models for the task.</li><li>Cut inference time by 25% and memory usage by 30%, making generation practical on low-resource devices.</li></ul><div className="pills"><span className="pill">Python</span><span className="pill">Hugging Face</span><span className="pill">Diffusers</span></div></div>
            </div>
          </PointerHighlightDemo>
        </section>

        <section className={`section reveal ${revealedSections.has('experience') ? 'in' : ''}`} id="experience">
          <div className="section-head">
            <div className="path fineline"><span className="dot" />&nbsp;Experience</div>
            <h2 className="title">Experience</h2>
          </div>
          <div className="terminal">
            <div className="terminal-bar">Deloitte Australia — Technology Virtual Job Simulation, via Forage · May 2025</div>
            <div className="terminal-body"><div className="line"><span className="prompt">→</span>&nbsp;Simulated real-world development &amp; coding tasks aligned with Deloitte's technology consulting practice.</div><div className="line"><span className="prompt">→</span>&nbsp;Authored a client-focused proposal for a data dashboard solution.</div></div>
          </div>
        </section>

        <section className={`section reveal ${revealedSections.has('skills') ? 'in' : ''}`} id="skills">
          <div className="section-head">
            <div className="path fineline"><span className="dot" />&nbsp;Skills</div>
            <h2 className="title">Skills</h2>
          </div>
          <div className="diag-block">
            <div className="diag-group"><div className="diag-label">Languages</div><div className="diag-tags"><span className="diag-tag">JavaScript</span><span className="diag-tag">Python</span><span className="diag-tag">SQL</span><span className="diag-tag">C++</span><span className="diag-tag">C</span></div></div>
            <div className="diag-group"><div className="diag-label">Frameworks &amp; Libraries</div><div className="diag-tags"><span className="diag-tag">React.js</span><span className="diag-tag">Node.js</span><span className="diag-tag">Express.js</span><span className="diag-tag">Flask</span><span className="diag-tag">Tailwind CSS</span><span className="diag-tag">Redux</span></div></div>
            <div className="diag-group"><div className="diag-label">Databases</div><div className="diag-tags"><span className="diag-tag">MongoDB</span><span className="diag-tag">Firebase Firestore</span></div></div>
            <div className="diag-group"><div className="diag-label">Tools &amp; Practices</div><div className="diag-tags"><span className="diag-tag">VS Code</span><span className="diag-tag">GitHub</span><span className="diag-tag">Postman</span><span className="diag-tag">CI/CD</span><span className="diag-tag">REST APIs</span><span className="diag-tag">Agile</span></div></div>
          </div>
        </section>

        <section className={`section reveal ${revealedSections.has('achievements') ? 'in' : ''}`} id="achievements">
          <div className="section-head"><div className="path fineline"><span className="dot" />&nbsp;Achievements</div><h2 className="title">Certifications &amp; Achievements</h2></div>
          <div className="ach-list"><div className="ach-item"><div className="idx mono">01</div><p><b>FOSS Hackathon 2025</b> — contributed to an AI coding assistant project focused on code correction.</p></div><div className="ach-item"><div className="idx mono">02</div><p><b>Smart India Hackathon (SIH)</b> — contributed to a team that placed in the top 15 at the college level.</p></div><div className="ach-item"><div className="idx mono">03</div><p>Won a prize at <b>SharkIndia</b> (Avenyou Club) for an AI-based solution.</p></div><div className="ach-item"><div className="idx mono">04</div><p><b>Gen-AI Certification</b> — plus an independent custom model built for intelligent code correction and debugging.</p></div></div>
        </section>

        <section className={`section reveal ${revealedSections.has('interests') ? 'in' : ''}`} id="interests">
          <div className="section-head"><div className="path fineline"><span className="dot" />&nbsp;Interests</div><h2 className="title">Off the clock</h2></div>
          <div className="chip-row"><span className="chip">Guitar</span><span className="chip">Chess</span><span className="chip">Gym</span><span className="chip">Cooking</span><span className="chip">Reading</span></div>
        </section>

        <HireMeDashboard />
      </main>

      <footer id="contact">
        <TargetCursorDemo className="footer-target">
          <div className="wrap">
            <div className="path fineline"><span className="dot" />&nbsp;Contact</div>
            <h2 className="contact-title">Building something interesting? I'd like to hear about it.</h2>
            <div className="contact-links">
              <a className="contact-btn" href="mailto:sahilpathak2005@gmail.com"><Icon><path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/></Icon>sahilpathak2005@gmail.com</a>
              <a className="contact-btn" href="https://github.com/sahil454521" target="_blank" rel="noopener noreferrer"><Icon><path d="M12 2C6.48 2 2 6.48 2 12a10 10 0 0 0 6.84 9.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/></Icon>github.com/sahil454521</a>
              <a className="contact-btn" href="tel:+917276092128"><Icon><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></Icon>+91 72760 92128</a>
            </div>
            <div className="foot-bottom"><span>© <span id="year"></span> Sahil Pathak</span><span>Designed like the systems I build — quiet, precise, considered.</span></div>
          </div>
        </TargetCursorDemo>
      </footer>
      <PokemonBattleModal
        isOpen={arcadeOpen}
        onClose={() => setArcadeOpen(false)}
        initialMode={arcadeMode}
      />
    </>
  )
}

export default App
