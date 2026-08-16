import { useState, useEffect, useRef } from 'react'
import { FaGamepad, FaFileLines, FaTrophy, FaXmark, FaVolumeHigh, FaVolumeXmark, FaArrowRight, FaRotateLeft, FaDownload } from 'react-icons/fa6'

const RESUME_URL = 'https://docs.google.com/document/d/13mbt09Y85GFBqK1XHz-hsDIynav9VCoxI2sYTTiSjNk/edit?usp=sharing'

export default function ArcadeGameModal({ isOpen, onClose, initialMode = 'choice' }) {
  const [mode, setMode] = useState(initialMode) // 'choice' | 'playing' | 'resume'
  const [soundOn, setSoundOn] = useState(true)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('neon_hiscore')) || 0)
  const [wave, setWave] = useState(1)
  const [hp, setHp] = useState(100)
  const [shield, setShield] = useState(0)
  const [bossHp, setBossHp] = useState({ current: 0, max: 1, active: false })
  const [gameOver, setGameOver] = useState(false)
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('sahil_resume_unlocked') === 'true')
  const canvasRef = useRef(null)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  // Game Engine Effect
  useEffect(() => {
    if (mode !== 'playing' || !isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const handleResize = () => {
      if (!canvas) return
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', handleResize)

    /* AUDIO SYSTEM */
    let audioCtx = null
    let masterGain = null

    const initAudio = () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return
        audioCtx = new AC()
        masterGain = audioCtx.createGain()
        masterGain.gain.value = 0.25
        masterGain.connect(audioCtx.destination)
      } catch (e) {
        console.warn('Audio init error:', e)
      }
    }

    const playTone = (freq, type, duration, vol = 1) => {
      if (!audioCtx || !soundOn) return
      try {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.1, audioCtx.currentTime + duration)
        gain.gain.setValueAtTime(vol * 0.3, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start()
        osc.stop(audioCtx.currentTime + duration)
      } catch (e) {}
    }

    const playNoise = (duration) => {
      if (!audioCtx || !soundOn) return
      try {
        const bufferSize = audioCtx.sampleRate * duration
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
        const noise = audioCtx.createBufferSource()
        noise.buffer = buffer
        const gain = audioCtx.createGain()
        const filter = audioCtx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 1000
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
        noise.connect(filter)
        filter.connect(gain)
        gain.connect(masterGain)
        noise.start()
      } catch (e) {}
    }

    const playShoot = () => playTone(800, 'sawtooth', 0.15, 0.5)
    const playEnemyShoot = () => playTone(200, 'square', 0.3, 0.3)
    const playExplosion = () => playNoise(0.4)
    const playPowerup = () => {
      playTone(600, 'sine', 0.1)
      setTimeout(() => playTone(1200, 'sine', 0.2), 100)
    }

    initAudio()

    /* INPUT SYSTEM */
    const Input = { joyX: 0, joyY: 0, shooting: false }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') Input.joyX = -1
      if (e.key === 'ArrowRight' || e.key === 'd') Input.joyX = 1
      if (e.key === 'ArrowUp' || e.key === 'w') Input.joyY = -1
      if (e.key === 'ArrowDown' || e.key === 's') Input.joyY = 1
      if (e.code === 'Space') Input.shooting = true
    }

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) Input.joyX = 0
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) Input.joyY = 0
      if (e.code === 'Space') Input.shooting = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Touch Joystick setup
    const stickZone = document.getElementById('arcade-stick-zone')
    const knob = document.getElementById('arcade-knob')
    let stickStart = null

    const handleStick = (x, y, type) => {
      if (type === 'start') {
        if (!stickZone) return
        const rect = stickZone.getBoundingClientRect()
        stickStart = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      } else if (type === 'move' && stickStart) {
        const dx = x - stickStart.x
        const dy = y - stickStart.y
        const max = 40
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), max)
        const angle = Math.atan2(dy, dx)
        const mx = Math.cos(angle) * dist
        const my = Math.sin(angle) * dist

        if (knob) knob.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`
        Input.joyX = mx / max
        Input.joyY = my / max
      } else {
        stickStart = null
        if (knob) knob.style.transform = `translate(-50%, -50%)`
        Input.joyX = 0
        Input.joyY = 0
      }
    }

    const onTouchStart = (e) => {
      e.preventDefault()
      handleStick(e.touches[0].clientX, e.touches[0].clientY, 'start')
    }
    const onTouchMove = (e) => {
      e.preventDefault()
      handleStick(e.touches[0].clientX, e.touches[0].clientY, 'move')
    }
    const onTouchEnd = (e) => {
      e.preventDefault()
      handleStick(0, 0, 'end')
    }

    if (stickZone) {
      stickZone.addEventListener('touchstart', onTouchStart, { passive: false })
      stickZone.addEventListener('touchmove', onTouchMove, { passive: false })
      stickZone.addEventListener('touchend', onTouchEnd, { passive: false })
    }

    const fireBtn = document.getElementById('arcade-fire-btn')
    const onFireStart = (e) => { e.preventDefault(); Input.shooting = true }
    const onFireEnd = (e) => { e.preventDefault(); Input.shooting = false }

    if (fireBtn) {
      fireBtn.addEventListener('touchstart', onFireStart, { passive: false })
      fireBtn.addEventListener('touchend', onFireEnd, { passive: false })
      fireBtn.addEventListener('mousedown', () => { Input.shooting = true })
      fireBtn.addEventListener('mouseup', () => { Input.shooting = false })
    }

    /* GRAPHIC ENTITIES & GAME STATE */
    let glitchAmt = 0
    let floaters = []
    const spawnText = (x, y, txt, col) => floaters.push({ x, y, txt, col, life: 1, vy: -2 })

    class Particle {
      constructor(x, y, col, speed, type) {
        this.x = x; this.y = y; this.col = col
        const a = Math.random() * 6.28
        const s = Math.random() * speed
        this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s
        this.life = 1; this.decay = Math.random() * 0.03 + 0.02
        this.type = type // 0=dot, 1=shockwave
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life -= this.decay
        if (this.type === 1) this.life -= 0.05
      }
      draw() {
        ctx.globalAlpha = Math.max(0, this.life)
        if (this.type === 1) {
          ctx.strokeStyle = this.col; ctx.lineWidth = 2; ctx.beginPath()
          ctx.arc(this.x, this.y, (1 - this.life) * 50, 0, 6.28); ctx.stroke()
        } else {
          ctx.fillStyle = this.col; ctx.fillRect(this.x, this.y, 3, 3)
        }
        ctx.globalAlpha = 1
      }
    }

    class PowerUp {
      constructor(x, y) {
        this.x = x; this.y = y; this.w = 30; this.h = 30
        this.type = Math.random() > 0.5 ? 'M' : 'S'
        this.col = this.type === 'M' ? '#f0f' : '#0f0'
      }
      update() { this.y += 2 }
      draw() {
        ctx.shadowBlur = 10; ctx.shadowColor = this.col
        ctx.fillStyle = '#000'; ctx.strokeStyle = this.col; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(this.x, this.y, 15, 0, 6.28); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'
        ctx.fillText(this.type, this.x, this.y + 5)
        ctx.shadowBlur = 0
      }
    }

    class Bullet {
      constructor(x, y, isEnemy, vx = 0) {
        this.x = x; this.y = y; this.isEnemy = isEnemy; this.vx = vx
        this.vy = isEnemy ? 6 : -12
        this.col = isEnemy ? '#f00' : '#0ff'
        this.dead = false
      }
      update() {
        this.x += this.vx; this.y += this.vy
        if (this.y < 0 || this.y > H || this.x < 0 || this.x > W) this.dead = true
      }
      draw() {
        ctx.shadowBlur = 10; ctx.shadowColor = this.col
        ctx.fillStyle = this.col; ctx.fillRect(this.x - 2, this.y - 5, 4, 15)
        ctx.shadowBlur = 0
      }
    }

    class Boss {
      constructor() {
        this.x = W / 2; this.y = -100; this.w = 120; this.h = 80
        this.hp = 500; this.maxHp = 500
        this.active = false; this.dir = 1
      }
      update() {
        if (this.y < 100) this.y += 2
        else this.active = true

        if (this.active) {
          this.x += this.dir * 2
          if (this.x > W - 80 || this.x < 80) this.dir *= -1
          if (Math.random() < 0.05) {
            playEnemyShoot()
            for (let i = -2; i <= 2; i++) bullets.push(new Bullet(this.x, this.y + 40, true, i))
          }
        }
      }
      draw() {
        ctx.save(); ctx.translate(this.x, this.y)
        ctx.shadowBlur = 30; ctx.shadowColor = '#f00'
        ctx.fillStyle = '#300'; ctx.strokeStyle = '#f00'; ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(-60, -20); ctx.lineTo(60, -20)
        ctx.lineTo(40, 40); ctx.lineTo(0, 60); ctx.lineTo(-40, 40)
        ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.5})`
        ctx.beginPath(); ctx.arc(0, 10, 15, 0, 6.28); ctx.fill()
        ctx.restore()
      }
    }

    let running = true
    let currentScore = 0
    let currentWave = 1
    let particles = []
    let bullets = []
    let enemies = []
    let powerups = []
    let boss = null
    let bgOffset = 0

    const player = {
      x: W / 2, y: H - 100, w: 40, h: 40, hp: 100, dead: false, weaponLevel: 1, shield: 0, cooldown: 0,
    }

    const shake = (amt) => {
      glitchAmt = amt
      if (navigator.vibrate) navigator.vibrate(amt * 5)
    }

    const explode = (x, y, col, count) => {
      playExplosion()
      particles.push(new Particle(x, y, col, 0, 1))
      for (let i = 0; i < count; i++) particles.push(new Particle(x, y, col, 8, 0))
    }

    const damagePlayer = (amt) => {
      if (player.shield > 0) {
        player.shield -= amt
        if (player.shield < 0) player.shield = 0
        setShield(player.shield)
        spawnText(player.x, player.y, 'ABSORBED', '#0f0')
      } else {
        player.hp -= amt
        if (player.hp < 0) player.hp = 0
        setHp(player.hp)
        shake(20)
        spawnText(player.x, player.y, '-' + amt, '#f00')
        if (player.hp <= 0) {
          player.dead = true
          explode(player.x, player.y, '#0ff', 40)
          setTimeout(() => {
            running = false
            setGameOver(true)
            localStorage.setItem('sahil_resume_unlocked', 'true')
            setUnlocked(true)
          }, 1500)
        }
      }
    }

    const nextWave = () => {
      currentWave++
      setWave(currentWave)
      enemies = []

      // Unlock resume after reaching wave 2 or score > 200
      if (currentWave >= 2) {
        localStorage.setItem('sahil_resume_unlocked', 'true')
        setUnlocked(true)
      }

      if (currentWave % 5 === 0) {
        boss = new Boss()
        boss.maxHp = 500 * (currentWave / 5)
        boss.hp = boss.maxHp
        setBossHp({ current: boss.hp, max: boss.maxHp, active: true })
      } else {
        boss = null
        setBossHp({ current: 0, max: 1, active: false })
        const rows = 3 + Math.min(currentWave, 5)
        const cols = 4 + Math.min(currentWave, 4)
        const startX = (W - cols * 50) / 2
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let type = r === 0 ? 1 : 0
            if (currentWave > 2 && Math.random() < 0.2) type = 2
            enemies.push({
              x: startX + c * 50,
              y: -200 + r * 50,
              w: 30,
              h: 30,
              type: type,
              hp: (type + 1) * 10,
              tx: startX + c * 50,
              ty: 80 + r * 50,
              state: 'enter',
              col: type === 2 ? '#f00' : type === 1 ? '#f0f' : '#0f0',
            })
          }
        }
      }
    }

    // Init First Wave
    nextWave()

    let animFrameId = null

    const gameLoop = () => {
      if (!running) return

      // Update Player
      if (!player.dead) {
        player.x += Input.joyX * 7
        player.y += Input.joyY * 7
        player.x = Math.max(20, Math.min(W - 20, player.x))
        player.y = Math.max(H / 2, Math.min(H - 40, player.y))

        if (Input.shooting && !player.cooldown) {
          playShoot()
          player.cooldown = 10
          if (player.weaponLevel === 1) {
            bullets.push(new Bullet(player.x, player.y - 20, false))
          } else {
            bullets.push(new Bullet(player.x, player.y - 20, false))
            bullets.push(new Bullet(player.x - 10, player.y - 15, false, -1))
            bullets.push(new Bullet(player.x + 10, player.y - 15, false, 1))
          }
        }
        if (player.cooldown) player.cooldown--
      }

      // Update Boss
      if (boss) {
        boss.update()
        setBossHp({ current: boss.hp, max: boss.maxHp, active: true })
        if (Math.abs(boss.x - player.x) < 80 && Math.abs(boss.y - player.y) < 60) {
          damagePlayer(100)
        }
      }

      // Update Enemies
      let activeEnemies = false
      enemies.forEach((e) => {
        if (e.hp <= 0) return
        activeEnemies = true

        if (e.state === 'enter') {
          e.y += (e.ty - e.y) * 0.05
          if (Math.abs(e.y - e.ty) < 2) e.state = 'idle'
        } else if (e.state === 'idle') {
          e.x += Math.sin(Date.now() / 500) * 2
          if (e.type === 2 && Math.random() < 0.005) e.state = 'dive'
          if (e.type === 1 && Math.random() < 0.005) {
            playEnemyShoot()
            bullets.push(new Bullet(e.x, e.y + 20, true))
          }
        } else if (e.state === 'dive') {
          e.y += 6
          e.x += (player.x - e.x) * 0.02
          if (e.y > H) e.hp = 0
        }

        if (!player.dead && Math.abs(e.x - player.x) < 30 && Math.abs(e.y - player.y) < 30) {
          e.hp = 0
          damagePlayer(20)
        }
      })

      if (!activeEnemies && !boss) nextWave()

      // Update Bullets
      bullets.forEach((b) => {
        b.update()
        if (b.isEnemy) {
          if (!player.dead && Math.abs(b.x - player.x) < 20 && Math.abs(b.y - player.y) < 20) {
            b.dead = true
            damagePlayer(20)
          }
        } else {
          let hit = false
          if (boss && Math.abs(b.x - boss.x) < 60 && Math.abs(b.y - boss.y) < 40) {
            boss.hp -= 10
            b.dead = true
            hit = true
            spawnText(boss.x + (Math.random() - 0.5) * 40, boss.y + 20, '-10', '#fff')
            if (boss.hp <= 0) {
              explode(boss.x, boss.y, '#f00', 50)
              currentScore += 1000
              setScore(currentScore)
              boss = null
              setBossHp({ current: 0, max: 1, active: false })
            }
          }

          enemies.forEach((e) => {
            if (!hit && e.hp > 0 && Math.abs(b.x - e.x) < 20 && Math.abs(b.y - e.y) < 20) {
              e.hp -= 10
              b.dead = true
              hit = true
              if (e.hp <= 0) {
                explode(e.x, e.y, e.col, 10)
                currentScore += 50
                setScore(currentScore)

                if (currentScore > highScore) {
                  setHighScore(currentScore)
                  localStorage.setItem('neon_hiscore', String(currentScore))
                }

                if (currentScore >= 200) {
                  localStorage.setItem('sahil_resume_unlocked', 'true')
                  setUnlocked(true)
                }

                if (Math.random() < 0.1) powerups.push(new PowerUp(e.x, e.y))
              } else {
                spawnText(e.x, e.y - 10, '-10', '#fff')
              }
            }
          })
        }
      })
      bullets = bullets.filter((b) => !b.dead)

      // Update Powerups
      powerups.forEach((p) => {
        p.update()
        if (Math.abs(p.x - player.x) < 30 && Math.abs(p.y - player.y) < 30) {
          playPowerup()
          if (p.type === 'M') {
            player.weaponLevel = 2
            spawnText(player.x, player.y - 30, 'MULTI-SHOT', '#f0f')
          }
          if (p.type === 'S') {
            player.shield = 100
            setShield(100)
            spawnText(player.x, player.y - 30, 'SHIELD UP', '#0f0')
          }
          p.y = H + 100
        }
      })
      powerups = powerups.filter((p) => p.y < H)

      if (glitchAmt > 0) glitchAmt--

      // DRAWING
      let ox = (Math.random() - 0.5) * glitchAmt
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(ox, 0)
      bgOffset = (bgOffset + 1) % 40
      ctx.strokeStyle = 'rgba(0, 50, 100, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()

      for (let x = -W; x < W * 2; x += 80) {
        ctx.moveTo(x, H)
        ctx.lineTo((x - W / 2) * 0.1 + W / 2, 0)
      }
      for (let y = 0; y < H; y += 40) {
        let dy = (y + bgOffset) % H
        if (dy > H / 2) {
          ctx.moveTo(0, dy)
          ctx.lineTo(W, dy)
        }
      }
      ctx.stroke()

      ctx.globalCompositeOperation = 'lighter'

      powerups.forEach((p) => p.draw())

      if (!player.dead) {
        ctx.save()
        ctx.translate(player.x, player.y)
        ctx.rotate(Input.joyX * 0.2)
        ctx.shadowBlur = 20
        ctx.shadowColor = player.shield > 0 ? '#0f0' : '#0ff'
        ctx.strokeStyle = player.shield > 0 ? '#0f0' : '#0ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, -20); ctx.lineTo(15, 15); ctx.lineTo(0, 10); ctx.lineTo(-15, 15)
        ctx.closePath(); ctx.stroke()

        ctx.fillStyle = '#f0f'
        ctx.beginPath()
        ctx.moveTo(-5, 15); ctx.lineTo(5, 15); ctx.lineTo(0, 30 + Math.random() * 10)
        ctx.fill()
        ctx.restore()
      }

      enemies.forEach((e) => {
        if (e.hp <= 0) return
        ctx.save()
        ctx.translate(e.x, e.y)
        ctx.shadowBlur = 15
        ctx.shadowColor = e.col
        ctx.fillStyle = e.col
        if (e.type === 0) {
          ctx.fillRect(-15, -10, 30, 20)
          ctx.clearRect(-5, -5, 10, 10)
        } else if (e.type === 1) {
          ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(15, -10); ctx.lineTo(0, 15)
          ctx.fill()
        } else {
          ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.28)
          ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.strokeStyle = e.col; ctx.stroke()
        }
        ctx.restore()
      })

      if (boss) boss.draw()
      bullets.forEach((b) => b.draw())
      particles.forEach((p) => { p.update(); p.draw() })
      particles = particles.filter((p) => p.life > 0)

      ctx.globalCompositeOperation = 'source-over'
      floaters.forEach((f) => {
        f.y += f.vy; f.life -= 0.02
        ctx.globalAlpha = Math.max(0, f.life)
        ctx.fillStyle = f.col
        ctx.font = 'bold 20px Rajdhani'
        ctx.textAlign = 'center'
        ctx.fillText(f.txt, f.x, f.y)
      })
      floaters = floaters.filter((f) => f.life > 0)
      ctx.globalAlpha = 1
      ctx.restore()

      animFrameId = requestAnimationFrame(gameLoop)
    }

    animFrameId = requestAnimationFrame(gameLoop)

    return () => {
      running = false
      if (animFrameId) cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (stickZone) {
        stickZone.removeEventListener('touchstart', onTouchStart)
        stickZone.removeEventListener('touchmove', onTouchMove)
        stickZone.removeEventListener('touchend', onTouchEnd)
      }
      if (fireBtn) {
        fireBtn.removeEventListener('touchstart', onFireStart)
        fireBtn.removeEventListener('touchend', onFireEnd)
      }
      if (audioCtx) {
        try { audioCtx.close() } catch (e) {}
      }
    }
  }, [mode, isOpen, soundOn])

  if (!isOpen) return null

  return (
    <div className="arcade-modal-backdrop">
      {/* 1. CHOICE SCREEN */}
      {mode === 'choice' && (
        <div className="arcade-choice-card">
          <button className="arcade-close-btn" onClick={onClose} aria-label="Close">
            <FaXmark />
          </button>

          <div className="arcade-badge">
            <span className="core" /> Interactive Resume Access
          </div>

          <h2 className="arcade-choice-title">
            Choose Your Access Level <span>Sahil Pathak — AI &amp; Full-Stack</span>
          </h2>

          <p className="arcade-choice-desc">
            Want to review my resume right away, or test your skills in my retro CRT arcade game to unlock special achievements?
          </p>

          <div className="arcade-options-grid">
            <div className="arcade-option-card direct" onClick={() => setMode('resume')}>
              <div className="option-icon">
                <FaFileLines />
              </div>
              <div className="option-tag">FAST TRACK</div>
              <h3>Direct Resume Access</h3>
              <p>View &amp; download Sahil&apos;s official Google Doc Resume directly in your browser.</p>
              <button className="option-btn direct-btn">
                Open Resume Direct <FaArrowRight />
              </button>
            </div>

            <div
              className="arcade-option-card game"
              onClick={() => {
                setGameOver(false)
                setHp(100)
                setShield(0)
                setScore(0)
                setWave(1)
                setMode('playing')
              }}
            >
              <div className="option-icon neon">
                <FaGamepad />
              </div>
              <div className="option-tag neon-tag">RETRO ARCADE</div>
              <h3>Ultimate Ride Challenge</h3>
              <p>Play the CRT space shooter! Clear Wave 1 or score 200+ points to unlock the interactive resume + high score badge.</p>
              <button className="option-btn game-btn">
                Launch Arcade Game <FaGamepad />
              </button>
            </div>
          </div>

          {unlocked && (
            <div className="unlocked-banner" onClick={() => setMode('resume')}>
              <FaTrophy /> <b>Resume Unlocked!</b> You&apos;ve cleared the arcade challenge. Click to view resume.
            </div>
          )}
        </div>
      )}

      {/* 2. RESUME VIEW SCREEN */}
      {mode === 'resume' && (
        <div className="arcade-resume-card">
          <div className="arcade-resume-header">
            <div>
              <h2>Sahil Pathak — Resume</h2>
              <p>AI/ML Engineer &amp; Full-Stack Developer · DY Patil International University &amp; IIT Guwahati</p>
            </div>
            <div className="header-actions">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent-glow"
              >
                <FaDownload /> Open Google Doc Resume
              </a>
              <button className="btn-secondary" onClick={() => setMode('choice')}>
                Back to Choices
              </button>
              <button className="arcade-close-btn inline" onClick={onClose} aria-label="Close">
                <FaXmark />
              </button>
            </div>
          </div>

          <div className="resume-body-content">
            <div className="resume-section">
              <h4>Summary</h4>
              <p>
                Full-stack software engineer and AI researcher specializing in intelligent developer tools (<b>AiCompiler</b>)
                and clinical AI models (<b>PPEMDD</b>). Proficient in React, Node.js, Flask, Python ML libraries, and custom multi-modal attention networks.
              </p>
            </div>

            <div className="resume-grid-2col">
              <div className="resume-block">
                <h4>Core Technical Skills</h4>
                <ul>
                  <li><b>Languages:</b> JavaScript, Python, SQL, C++, C</li>
                  <li><b>Frameworks:</b> React.js, Node.js, Express.js, Flask, Tailwind CSS, Redux</li>
                  <li><b>Databases &amp; Tools:</b> MongoDB, Firebase, Convex, Git, GitHub, Postman, CI/CD</li>
                  <li><b>Applied ML:</b> Diffusers, Dynamic Gating Networks, TF-IDF/LSA, PyTorch, Hugging Face</li>
                </ul>
              </div>

              <div className="resume-block">
                <h4>Education &amp; Credentials</h4>
                <ul>
                  <li><b>DY Patil International University:</b> B.Tech in CSE (2023 — 2027)</li>
                  <li><b>IIT Guwahati:</b> Specialization in AI &amp; Data Science (2023 — 2027)</li>
                  <li><b>Deloitte Australia:</b> Tech Consulting Job Simulation (May 2025)</li>
                </ul>
              </div>
            </div>

            <div className="resume-section">
              <h4>Featured Research &amp; Projects</h4>
              <ul>
                <li>
                  <b>PPEMDD (Sole Author):</b> Multimodal Depression Detection Framework combining Text, EEG, Wearable, and Audio/Video signals with 91.24% test accuracy.
                </li>
                <li>
                  <b>AiCompiler:</b> AI code editor with inline suggestions, real-time Convex DB back-end, and Clerk auth.
                </li>
                <li>
                  <b>AI Image Generator:</b> Hugging Face diffusers pipeline optimized for 25% faster inference on consumer hardware.
                </li>
              </ul>
            </div>
          </div>

          <div className="resume-footer-actions">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-main-accent"
            >
              View Full PDF / Google Doc <FaArrowRight />
            </a>
            <button
              className="btn-arcade-launch"
              onClick={() => {
                setGameOver(false)
                setHp(100)
                setShield(0)
                setScore(0)
                setWave(1)
                setMode('playing')
              }}
            >
              <FaGamepad /> Play Arcade Game
            </button>
          </div>
        </div>
      )}

      {/* 3. RETRO ARCADE GAME OVERLAY */}
      {mode === 'playing' && (
        <div className="arcade-game-container">
          <canvas ref={canvasRef} id="gameCanvas" />
          <div className="overlay-fx" />

          {/* HUD Layer */}
          <div id="ui-layer">
            <div className="hud-row">
              <div className="hud-box">
                <span className="hud-label">SCORE</span>
                <span className="hud-val">{score}</span>
              </div>
              <div className="hud-box">
                <span className="hud-label">HIGH SCORE</span>
                <span className="hud-val">{highScore}</span>
              </div>
              <div className="hud-box top-actions">
                <button
                  className="game-top-btn"
                  onClick={() => setSoundOn(!soundOn)}
                  title="Toggle Sound"
                >
                  {soundOn ? <FaVolumeHigh /> : <FaVolumeXmark />}
                </button>
                <button
                  className="game-top-btn exit"
                  onClick={() => setMode('choice')}
                  title="Exit Arcade"
                >
                  <FaXmark />
                </button>
              </div>
            </div>

            <div className="hud-row">
              <div className="hud-box" style={{ textAlign: 'left' }}>
                <span className="hud-label" style={{ color: '#f0f' }}>WAVE</span>
                <span className="hud-val">{wave}</span>
              </div>
              <div className="hud-box" style={{ textAlign: 'right' }}>
                <span className="hud-label" style={{ color: shield > 0 ? '#0f0' : hp < 30 ? '#f00' : '#0ff' }}>
                  {shield > 0 ? 'SHIELD' : 'SHIELD/HP'}
                </span>
                <span
                  className="hud-val"
                  style={{ color: shield > 0 ? '#0f0' : hp < 30 ? '#f00' : '#0ff' }}
                >
                  {shield > 0 ? `${shield}%` : `${hp}%`}
                </span>
              </div>
            </div>

            {bossHp.active && (
              <div id="boss-hp-bar" style={{ display: 'block' }}>
                <div
                  id="boss-hp-fill"
                  style={{ width: `${Math.max(0, (bossHp.current / bossHp.max) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Touch Controls for Mobile */}
          <div id="controls">
            <div id="arcade-stick-zone">
              <div className="stick-base" />
              <div className="stick-knob" id="arcade-knob" />
            </div>
            <div id="arcade-fire-btn">FIRE</div>
          </div>

          {/* Game Over / Victory Overlay */}
          {gameOver && (
            <div id="arcade-overlay">
              <h1 className="game-title">
                GAME OVER<br />
                <span>SCORE: {score}</span>
              </h1>

              <div className="game-over-badge">
                <FaTrophy style={{ color: '#0ff' }} /> RESUME UNLOCKED!
              </div>

              <div className="game-over-buttons">
                <button
                  className="arcade-btn primary"
                  onClick={() => setMode('resume')}
                >
                  <FaFileLines /> VIEW RESUME NOW
                </button>
                <button
                  className="arcade-btn secondary"
                  onClick={() => {
                    setGameOver(false)
                    setHp(100)
                    setShield(0)
                    setScore(0)
                    setWave(1)
                    setMode('playing')
                  }}
                >
                  <FaRotateLeft /> PLAY AGAIN
                </button>
                <button
                  className="arcade-btn quit"
                  onClick={() => setMode('choice')}
                >
                  EXIT ARCADE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
