import Marquee from 'react-fast-marquee'
import { FaCode, FaDatabase, FaGithub, FaReact } from 'react-icons/fa'
import { FaNodeJs, FaPython, FaGear } from 'react-icons/fa6'

const firstRow = [
  { label: 'React', icon: <FaReact /> },
  { label: 'Node.js', icon: <FaNodeJs /> },
  { label: 'Express', icon: <FaCode /> },
  { label: 'MongoDB', icon: <FaDatabase /> },
  { label: 'Tailwind', icon: <FaGear /> },
]

const secondRow = [
  { label: 'Python', icon: <FaPython /> },
  { label: 'TensorFlow', icon: <FaGear /> },
  { label: 'GitHub', icon: <FaGithub /> },
  { label: 'AI Tools', icon: <FaCode /> },
  { label: 'Full Stack', icon: <FaReact /> },
]

function MarqueeChip({ label, icon }) {
  return (
    <span className="marquee-chip">
      <span className="marquee-icon">{icon}</span>
      {label}
    </span>
  )
}

export default function SkillMarquee() {
  return (
    <section className="section marquee-section" aria-label="Currently working with">
      <div className="section-head">
        <div className="path mono">~/stack.marquee</div>
        <h2 className="title">Currently working with</h2>
      </div>

      <div className="marquee-shell">
        <Marquee gradient={false} speed={42} pauseOnHover>
          {firstRow.map((item) => (
            <MarqueeChip key={item.label} label={item.label} icon={item.icon} />
          ))}
        </Marquee>

        <Marquee gradient={false} speed={42} pauseOnHover direction="right">
          {secondRow.map((item) => (
            <MarqueeChip key={item.label} label={item.label} icon={item.icon} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}