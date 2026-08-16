import { useState, useEffect, useRef } from 'react'
import { FaGamepad, FaFileLines, FaTrophy, FaXmark, FaVolumeHigh, FaVolumeXmark, FaArrowRight, FaRotateLeft, FaDownload, FaBolt } from 'react-icons/fa6'
import charizardXImg from '../assets/charizardX.png'
import ashGreninjaImg from '../assets/ashGreninja.png'
import playerTrainerImg from '../assets/playerTrainer.png'
import opponentTrainerImg from '../assets/opponentTrainer.png'
import playerOverworldImg from '../assets/playerOverworld.png'
import opponentOverworldImg from '../assets/opponentOverworld.png'
import battleBgImg from '../assets/battleBg.png'

const RESUME_URL = 'https://docs.google.com/document/d/13mbt09Y85GFBqK1XHz-hsDIynav9VCoxI2sYTTiSjNk/edit?usp=sharing'

const SKILL_MOVES = [
  {
    name: 'Water Shuriken',
    skill: 'React & Node.js',
    type: 'Water',
    power: 120,
    desc: 'High-speed stream of full-stack water shurikens!',
    col: '#00d2ff',
  },
  {
    name: 'Night Slash',
    skill: 'AiCompiler Engine',
    type: 'Dark',
    power: 140,
    desc: 'Precision AI code completion slash with high critical hit rate!',
    col: '#9d50bb',
  },
  {
    name: 'Aerial Ace',
    skill: 'PPEMDD Multimodal AI',
    type: 'Flying',
    power: 130,
    desc: 'Never misses! Fuses EEG, Text & Vision signals into a fatal strike!',
    col: '#00f2fe',
  },
  {
    name: 'Double Team',
    skill: 'Python & ML Math',
    type: 'Normal',
    power: 0,
    heal: 60,
    desc: 'Creates neural network illusions to restore HP & boost evasion!',
    col: '#4facfe',
  },
]

export default function PokemonBattleModal({ isOpen, onClose, initialMode = 'choice' }) {
  const [mode, setMode] = useState(initialMode) // 'choice' | 'battle' | 'resume'
  const [soundOn, setSoundOn] = useState(true)
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('sahil_resume_unlocked') === 'true')

  // Battle State
  const [playerHp, setPlayerHp] = useState(250)
  const maxPlayerHp = 250
  const [bossHp, setBossHp] = useState(500)
  const maxBossHp = 500
  const [dialogText, setDialogText] = useState('Trainer SAHIL is walking on Route 1...')
  const [battleSubState, setBattleSubState] = useState('overworld_walk') // 'overworld_walk' | 'overworld_alert' | 'encounter_pixelate' | 'trainer_intro' | 'boss_sendout' | 'player_sendout' | 'menu' | 'moves' | 'animating' | 'victory' | 'defeated'
  const [activeAnim, setActiveAnim] = useState(null)

  const canvasRef = useRef(null)
  const audioCtxRef = useRef(null)
  const spritesRef = useRef({
    charizard: null,
    greninja: null,
    playerTrainer: null,
    opponentTrainer: null,
    playerOverworld: null,
    opponentOverworld: null,
    battleBg: null,
  })
  const introTimerRef = useRef([])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  // Pre-load and chroma key ALL pixel art sprites ONCE when component mounts
  useEffect(() => {
    const loadChromaSprite = (src, bgType) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          const c = document.createElement('canvas')
          c.width = img.width
          c.height = img.height
          const cx = c.getContext('2d')
          cx.drawImage(img, 0, 0)

          if (bgType === 'none') {
            resolve(c)
            return
          }

          const imgData = cx.getImageData(0, 0, c.width, c.height)
          const data = imgData.data

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            if (bgType === 'cyan') {
              if (Math.abs(r - 142) < 40 && Math.abs(g - 210) < 40 && Math.abs(b - 220) < 40) {
                data[i + 3] = 0
              }
            } else if (bgType === 'white') {
              // White or light background pixels
              if (r > 215 && g > 215 && b > 215) {
                data[i + 3] = 0
              }
              // Light grey & checkerboard pattern pixels
              else if (Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 160) {
                data[i + 3] = 0
              }
            }
          }
          cx.putImageData(imgData, 0, 0)
          resolve(c)
        }
      })
    }

    Promise.all([
      loadChromaSprite(charizardXImg, 'cyan'),
      loadChromaSprite(ashGreninjaImg, 'white'),
      loadChromaSprite(playerTrainerImg, 'white'),
      loadChromaSprite(opponentTrainerImg, 'white'),
      loadChromaSprite(playerOverworldImg, 'white'),
      loadChromaSprite(opponentOverworldImg, 'white'),
      loadChromaSprite(battleBgImg, 'none'),
    ]).then(([czCanvas, grCanvas, plTrCanvas, opTrCanvas, plOwCanvas, opOwCanvas, bgCanvas]) => {
      spritesRef.current.charizard = czCanvas
      spritesRef.current.greninja = grCanvas
      spritesRef.current.playerTrainer = plTrCanvas
      spritesRef.current.opponentTrainer = opTrCanvas
      spritesRef.current.playerOverworld = plOwCanvas
      spritesRef.current.opponentOverworld = opOwCanvas
      spritesRef.current.battleBg = bgCanvas
    })
  }, [])

  // Audio helper
  const playSound = (type) => {
    if (!soundOn) return
    try {
      if (!audioCtxRef.current) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (AC) audioCtxRef.current = new AC()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()

      if (type === 'encounter') {
        const arpeggio = [330, 440, 550, 660, 880, 1100]
        arpeggio.forEach((freq, idx) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'sawtooth'
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06)
          g.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.06)
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.15)
          o.connect(g)
          g.connect(ctx.destination)
          o.start(ctx.currentTime + idx * 0.06)
          o.stop(ctx.currentTime + idx * 0.06 + 0.15)
        })
      } else if (type === 'pokeball_open') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(400, ctx.currentTime)
        o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25)
        g.gain.setValueAtTime(0.25, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(ctx.currentTime)
        o.stop(ctx.currentTime + 0.25)
      } else if (type === 'attack') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(600, ctx.currentTime)
        o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25)
        g.gain.setValueAtTime(0.25, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(ctx.currentTime)
        o.stop(ctx.currentTime + 0.25)
      } else if (type === 'boss_fire') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(180, ctx.currentTime)
        o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.4)
        g.gain.setValueAtTime(0.35, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(ctx.currentTime)
        o.stop(ctx.currentTime + 0.4)
      } else if (type === 'hit') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'square'
        o.frequency.setValueAtTime(150, ctx.currentTime)
        o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3)
        g.gain.setValueAtTime(0.3, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(ctx.currentTime)
        o.stop(ctx.currentTime + 0.3)
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'triangle'
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12)
          g.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12)
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3)
          o.connect(g)
          g.connect(ctx.destination)
          o.start(ctx.currentTime + idx * 0.12)
          o.stop(ctx.currentTime + idx * 0.12 + 0.3)
        })
      }
    } catch (e) {}
  }

  const clearTimers = () => {
    introTimerRef.current.forEach((t) => clearTimeout(t))
    introTimerRef.current = []
  }

  // Start Overworld Encounter Sequence
  const startBattle = () => {
    clearTimers()
    setPlayerHp(250)
    setBossHp(500)
    setMode('battle')
    setBattleSubState('overworld_walk')
    setActiveAnim(null)
    setDialogText('Trainer SAHIL is walking on Route 1...')

    // Timeline Sequence:
    // 1. t=1800ms -> Player reaches Opponent! "!" pops over Opponent's head
    const t1 = setTimeout(() => {
      setBattleSubState('overworld_alert')
      setDialogText('! OPPONENT TRAINER wants to battle!')
      playSound('encounter')
    }, 1800)

    // 2. t=2800ms -> Screen starts to pixelate & flash black!
    const t2 = setTimeout(() => {
      setBattleSubState('encounter_pixelate')
    }, 2800)

    // 3. t=4000ms -> Transition to 2D Battle Arena! Dual Trainers stand in frame
    const t3 = setTimeout(() => {
      setBattleSubState('trainer_intro')
      setDialogText('OPPONENT TRAINER stepped up to battle Trainer SAHIL PATHAK!')
    }, 4000)

    // 4. t=5400ms -> Opponent sends out Mega Charizard X & slides out right
    const t4 = setTimeout(() => {
      setBattleSubState('boss_sendout')
      setDialogText('Opponent sent out MEGA CHARIZARD X!')
      playSound('pokeball_open')
    }, 5400)

    // 5. t=7000ms -> Trainer SAHIL sends out Ash-Greninja & slides out left
    const t5 = setTimeout(() => {
      setBattleSubState('player_sendout')
      setDialogText('Go! ASH-GRENINJA!')
      playSound('pokeball_open')
    }, 7000)

    // 6. t=8600ms -> Intro finishes, battle menu unlocks!
    const t6 = setTimeout(() => {
      setBattleSubState('menu')
      setDialogText('What will ASH-GRENINJA do?')
    }, 8600)

    introTimerRef.current = [t1, t2, t3, t4, t5, t6]
  }

  // Player Move Handler
  const handleUseMove = (move) => {
    if (battleSubState !== 'moves') return
    setBattleSubState('animating')
    setActiveAnim(move.name)
    playSound('attack')

    if (move.heal) {
      const newHp = Math.min(maxPlayerHp, playerHp + move.heal)
      setPlayerHp(newHp)
      setDialogText(`ASH-GRENINJA used ${move.name} (${move.skill})! Recovered ${move.heal} HP!`)

      const t1 = setTimeout(() => {
        setActiveAnim(null)
        bossTurn(newHp)
      }, 1400)
      introTimerRef.current.push(t1)
    } else {
      const damage = move.power + Math.floor(Math.random() * 25)
      const newBossHp = Math.max(0, bossHp - damage)
      setBossHp(newBossHp)
      setDialogText(`ASH-GRENINJA used ${move.name} (${move.skill})! Super Effective! Dealt ${damage} DMG!`)

      const t1 = setTimeout(() => {
        playSound('hit')
        if (newBossHp <= 0) {
          handleVictory()
        } else {
          setActiveAnim(null)
          bossTurn(playerHp, newBossHp)
        }
      }, 1400)
      introTimerRef.current.push(t1)
    }
  }

  // Boss Counter Attack (BLAST BURN)
  const bossTurn = (currPlayerHp, currBossHp = bossHp) => {
    if (currBossHp <= 0) return
    setActiveAnim('boss_attack')
    setDialogText('Enemy MEGA CHARIZARD X used BLAST BURN!')
    playSound('boss_fire')

    const t1 = setTimeout(() => {
      playSound('hit')
      const bossDamage = 35 + Math.floor(Math.random() * 20)
      const newPlayerHp = Math.max(0, currPlayerHp - bossDamage)
      setPlayerHp(newPlayerHp)

      if (newPlayerHp <= 0) {
        setDialogText('ASH-GRENINJA fainted! Click REPLAY to battle again!')
        setBattleSubState('defeated')
        setActiveAnim(null)
      } else {
        setDialogText(`MEGA CHARIZARD X dealt ${bossDamage} DMG! What will ASH-GRENINJA do?`)
        setBattleSubState('menu')
        setActiveAnim(null)
      }
    }, 1400)
    introTimerRef.current.push(t1)
  }

  // Victory Sequence
  const handleVictory = () => {
    setActiveAnim('victory_drop')
    playSound('victory')
    setDialogText('Enemy MEGA CHARIZARD X fainted! Trainer SAHIL won the battle!')
    localStorage.setItem('sahil_resume_unlocked', 'true')
    setUnlocked(true)

    const t1 = setTimeout(() => {
      setDialogText("🎉 MEGA CHARIZARD X dropped SAHIL'S RESUME! Click below to claim & view!")
      setBattleSubState('victory')
    }, 1600)
    introTimerRef.current.push(t1)
  }

  // Canvas 2D Interactive Pokémon Battle Arena
  useEffect(() => {
    if (mode !== 'battle' || !isOpen) return

    const canvas = canvasRef.current
    if (!canvas || !canvas.parentElement) return
    const ctx = canvas.getContext('2d')

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return
      canvas.width = canvas.parentElement.clientWidth || 800
      canvas.height = canvas.parentElement.clientHeight || 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animId = null
    let tick = 0
    let stageStartTick = 0
    let lastSubState = battleSubState

    const render = () => {
      tick++
      if (lastSubState !== battleSubState) {
        stageStartTick = tick
        lastSubState = battleSubState
      }
      const subStateTick = tick - stageStartTick

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // =========================================================================
      // SCENE A: OVERWORLD WALKING ENCOUNTER
      // =========================================================================
      if (
        battleSubState === 'overworld_walk' ||
        battleSubState === 'overworld_alert' ||
        battleSubState === 'encounter_pixelate'
      ) {
        ctx.fillStyle = '#15803d'
        ctx.fillRect(0, 0, W, H)

        const pathW = 160
        ctx.fillStyle = '#a16207'
        ctx.fillRect(W / 2 - pathW / 2, 0, pathW, H)
        ctx.fillStyle = '#ca8a04'
        ctx.fillRect(W / 2 - pathW / 2 + 10, 0, pathW - 20, H)

        ctx.fillStyle = '#166534'
        for (let x = 20; x < W; x += 60) {
          if (Math.abs(x - W / 2) < 100) continue
          for (let y = 20; y < H; y += 60) {
            ctx.fillRect(x, y, 14, 14)
          }
        }

        const oppOwX = W / 2
        const oppOwY = H * 0.28
        let plrOwY = H * 0.85

        if (battleSubState === 'overworld_walk') {
          const walkProg = Math.min(1, tick / 95)
          plrOwY = H * 0.85 - walkProg * (H * 0.40)
        } else {
          plrOwY = H * 0.45
        }

        if (spritesRef.current.opponentOverworld) {
          ctx.save()
          ctx.imageSmoothingEnabled = false
          const spriteW = 70
          const spriteH = 70
          ctx.translate(oppOwX - spriteW / 2, oppOwY - spriteH / 2)
          ctx.drawImage(spritesRef.current.opponentOverworld, 0, 0, spriteW, spriteH)
          ctx.restore()
        }

        if (battleSubState === 'overworld_alert' || battleSubState === 'encounter_pixelate') {
          ctx.save()
          ctx.translate(oppOwX, oppOwY - 55)
          ctx.fillStyle = '#ef4444'
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 3
          ctx.fillRect(-14, -24, 28, 38)
          ctx.strokeRect(-14, -24, 28, 38)

          ctx.fillStyle = '#ffffff'
          ctx.font = '900 22px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('!', 0, 4)
          ctx.restore()
        }

        if (spritesRef.current.playerOverworld) {
          ctx.save()
          ctx.imageSmoothingEnabled = false
          const bounceY = battleSubState === 'overworld_walk' ? Math.abs(Math.sin(tick * 0.25)) * 6 : 0
          const spriteW = 70
          const spriteH = 70
          ctx.translate(W / 2 - spriteW / 2, plrOwY - spriteH / 2 - bounceY)
          ctx.drawImage(spritesRef.current.playerOverworld, 0, 0, spriteW, spriteH)
          ctx.restore()
        }

        if (battleSubState === 'encounter_pixelate') {
          const pixelProg = Math.min(1, subStateTick / 45)
          ctx.fillStyle = '#020617'

          const blockSize = 40
          const cols = Math.ceil(W / blockSize)
          const rows = Math.ceil(H / blockSize)
          const totalBlocks = cols * rows
          const activeBlocks = Math.floor(pixelProg * totalBlocks)

          for (let i = 0; i < activeBlocks; i++) {
            const bx = (i % cols) * blockSize
            const by = Math.floor(i / cols) * blockSize
            ctx.fillRect(bx, by, blockSize, blockSize)
          }

          if (subStateTick % 6 < 3) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.fillRect(0, 0, W, H)
          }
        }

        animId = requestAnimationFrame(render)
        return
      }

      // =========================================================================
      // SCENE B: 2D BATTLE ARENA (Using Provided Forest Background!)
      // =========================================================================

      // Render Pixel Art Forest Background Image (battleBg.png)
      if (spritesRef.current.battleBg) {
        ctx.drawImage(spritesRef.current.battleBg, 0, 0, W, H)
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
        bgGrad.addColorStop(0, '#0b1329')
        bgGrad.addColorStop(0.55, '#172554')
        bgGrad.addColorStop(1, '#020617')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, W, H)
      }

      const oppX = W * 0.72
      const oppY = H * 0.42
      const plrX = W * 0.28
      const plrY = H * 0.70

      // --- 1. OPPONENT PODIUM & SPRITES ---
      ctx.fillStyle = 'rgba(30, 41, 59, 0.75)'
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(oppX, oppY + 65, 140, 32, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()

      let oppTrainerX = oppX
      let showOppTrainer = false

      if (battleSubState === 'trainer_intro') {
        showOppTrainer = true
        oppTrainerX = oppX
      } else if (battleSubState === 'boss_sendout') {
        const slideProg = Math.min(1, subStateTick / 35)
        oppTrainerX = oppX + slideProg * (W * 0.4)
        if (slideProg < 0.95) showOppTrainer = true
      }

      if (showOppTrainer && spritesRef.current.opponentTrainer) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        const spriteW = 120
        const spriteH = 140
        ctx.translate(oppTrainerX - spriteW / 2, oppY - spriteH / 2 - 10)
        ctx.drawImage(spritesRef.current.opponentTrainer, 0, 0, spriteW, spriteH)
        ctx.restore()
      }

      if (battleSubState !== 'trainer_intro') {
        if (bossHp > 0 || activeAnim === 'victory_drop') {
          ctx.save()
          ctx.imageSmoothingEnabled = false
          const floatY = Math.sin(tick * 0.06) * 6
          const spriteW = 200
          const spriteH = 160
          ctx.translate(oppX - spriteW / 2, oppY - spriteH / 2 + floatY)

          if (spritesRef.current.charizard) {
            ctx.drawImage(spritesRef.current.charizard, 0, 0, spriteW, spriteH)
          }
          ctx.restore()
        }
      }

      // --- 2. PLAYER PODIUM & SPRITES ---
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
      ctx.strokeStyle = '#0284c7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(plrX, plrY + 60, 150, 38, 0, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()

      let plrTrainerX = plrX
      let showPlrTrainer = false

      if (battleSubState === 'trainer_intro' || battleSubState === 'boss_sendout') {
        showPlrTrainer = true
        plrTrainerX = plrX
      } else if (battleSubState === 'player_sendout') {
        const slideProg = Math.min(1, subStateTick / 35)
        plrTrainerX = plrX - slideProg * (W * 0.4)
        if (slideProg < 0.95) showPlrTrainer = true
      }

      if (showPlrTrainer && spritesRef.current.playerTrainer) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        const spriteW = 120
        const spriteH = 160
        ctx.translate(plrTrainerX - spriteW / 2, plrY - spriteH / 2 - 15)
        ctx.drawImage(spritesRef.current.playerTrainer, 0, 0, spriteW, spriteH)
        ctx.restore()
      }

      let drawPokeballArc = false
      let drawEnergyBurst = false
      let sendoutProg = 1

      if (battleSubState === 'player_sendout') {
        sendoutProg = Math.min(1, subStateTick / 35)
        if (sendoutProg < 0.65) drawPokeballArc = true
        if (sendoutProg >= 0.45 && sendoutProg < 0.95) drawEnergyBurst = true
      }

      if (drawPokeballArc) {
        const pbX = plrTrainerX + sendoutProg * 180
        const pbY = plrY - Math.sin(sendoutProg * Math.PI) * 90
        ctx.save()
        ctx.translate(pbX, pbY)
        ctx.rotate(tick * 0.35)

        ctx.fillStyle = '#ef4444'
        ctx.beginPath(); ctx.arc(0, 0, 12, Math.PI, 0); ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI); ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.fillRect(-12, -2, 24, 4)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.restore()
      }

      if (drawEnergyBurst) {
        ctx.save()
        ctx.fillStyle = 'rgba(103, 232, 249, 0.6)'
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 45
        ctx.beginPath()
        ctx.arc(plrX, plrY, 35 + (sendoutProg - 0.45) * 140, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      if (playerHp > 0 && (battleSubState === 'menu' || battleSubState === 'moves' || battleSubState === 'animating' || (battleSubState === 'player_sendout' && sendoutProg >= 0.4))) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        const stanceY = Math.abs(Math.sin(tick * 0.08)) * 4
        const spriteW = 180
        const spriteH = 180
        ctx.translate(plrX - spriteW / 2, plrY - spriteH / 2 - stanceY)

        if (spritesRef.current.greninja) {
          ctx.drawImage(spritesRef.current.greninja, 0, 0, spriteW, spriteH)
        }
        ctx.restore()
      }

      // --- 3. ATTACK ANIMATIONS ---
      if (activeAnim === 'Water Shuriken') {
        ctx.save()
        const prog = (tick % 25) / 25
        const projX = plrX + (oppX - plrX) * prog
        const projY = plrY + (oppY - plrY) * prog
        ctx.translate(projX, projY)
        ctx.rotate(tick * 0.4)
        ctx.fillStyle = '#00f2fe'
        ctx.shadowColor = '#00f2fe'
        ctx.shadowBlur = 20
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2)
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -30); ctx.lineTo(0, -22); ctx.lineTo(-10, -30); ctx.fill()
        }
        ctx.restore()
      } else if (activeAnim === 'Night Slash') {
        ctx.save()
        ctx.translate(oppX, oppY)
        ctx.strokeStyle = '#c084fc'
        ctx.lineWidth = 8
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 30
        ctx.beginPath()
        ctx.arc(0, 0, 70, Math.PI * 0.2, Math.PI * 1.1)
        ctx.stroke()
        ctx.restore()
      } else if (activeAnim === 'Aerial Ace') {
        ctx.save()
        ctx.strokeStyle = '#67e8f9'
        ctx.lineWidth = 5
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 20
        for (let i = 0; i < 4; i++) {
          const sx = plrX + Math.random() * (oppX - plrX)
          const sy = plrY + Math.random() * (oppY - plrY)
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 90, sy - 45); ctx.stroke()
        }
        ctx.restore()
      } else if (activeAnim === 'boss_attack') {
        ctx.save()
        const prog = (tick % 30) / 30
        const fireX = oppX + (plrX - oppX) * prog
        const fireY = oppY + (plrY - oppY) * prog

        ctx.translate(fireX, fireY)
        ctx.fillStyle = '#ef4444'
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 30
        ctx.beginPath()
        ctx.arc(0, 0, 28, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#00f2fe'
        ctx.beginPath()
        ctx.arc(0, 0, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.translate(plrX, plrY)
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(tick * 0.5) * 0.3})`
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 40
        ctx.beginPath()
        ctx.arc(0, 0, 65 + (tick % 20), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else if (activeAnim === 'victory_drop') {
        const dropX = W * 0.5
        const dropY = H * 0.48
        ctx.save()
        ctx.translate(dropX, dropY)
        ctx.shadowColor = '#eab308'
        ctx.shadowBlur = 30

        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, 38 + Math.sin(tick * 0.1) * 6, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#eab308'
        ctx.fillRect(-16, -22, 32, 44)
        ctx.fillStyle = '#000'
        ctx.fillRect(-10, -15, 20, 4)
        ctx.fillRect(-10, -7, 20, 4)
        ctx.fillRect(-10, 1, 14, 4)

        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [mode, isOpen, bossHp, playerHp, activeAnim, battleSubState])

  if (!isOpen) return null

  const isOverworldState =
    battleSubState === 'overworld_walk' ||
    battleSubState === 'overworld_alert' ||
    battleSubState === 'encounter_pixelate'

  return (
    <div className="arcade-modal-backdrop">
      {/* 1. INITIAL CHOICE SCREEN */}
      {mode === 'choice' && (
        <div className="arcade-choice-card">
          <button className="arcade-close-btn" onClick={onClose} aria-label="Close">
            <FaXmark />
          </button>

          <div className="arcade-badge">
            <span className="core" /> Interactive Resume Access
          </div>

          <h2 className="arcade-choice-title">
            Select Resume Access Level <span>Sahil Pathak — AI &amp; Full-Stack</span>
          </h2>

          <p className="arcade-choice-desc">
            Choose whether to view Sahil&apos;s official resume directly, or challenge <b>Mega Charizard X</b> in a 2D Pokémon Red/Blue battle as <b>Ash-Greninja</b> to claim the resume trophy!
          </p>

          <div className="arcade-options-grid">
            <div className="arcade-option-card direct" onClick={() => setMode('resume')}>
              <div className="option-icon">
                <FaFileLines />
              </div>
              <div className="option-tag">FAST TRACK</div>
              <h3>Direct Resume Access</h3>
              <p>Instant access &amp; direct Google Doc view of Sahil Pathak&apos;s official resume.</p>
              <button className="option-btn direct-btn">
                Open Resume Direct <FaArrowRight />
              </button>
            </div>

            <div className="arcade-option-card game" onClick={startBattle}>
              <div className="option-icon neon">
                <FaGamepad />
              </div>
              <div className="option-tag neon-tag">2D POKÉMON BATTLE</div>
              <h3>Ash-Greninja vs Mega Charizard X</h3>
              <p>Walk overworld &amp; battle the Boss using Sahil&apos;s developer skills to spawn his Resume!</p>
              <button className="option-btn game-btn">
                Start Pokémon Battle ⚔️
              </button>
            </div>
          </div>

          {unlocked && (
            <div className="unlocked-banner" onClick={() => setMode('resume')}>
              <FaTrophy /> <b>Resume Unlocked!</b> Mega Charizard X was defeated! Click to view resume.
            </div>
          )}
        </div>
      )}

      {/* 2. DIRECT RESUME VIEW SCREEN */}
      {mode === 'resume' && (
        <div className="arcade-resume-card">
          <div className="arcade-resume-header">
            <div>
              <h2>Sahil Pathak — Official Resume</h2>
              <p>AI/ML Engineer &amp; Full-Stack Developer · DY Patil International University &amp; IIT Guwahati</p>
            </div>
            <div className="header-actions">
              <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="btn-accent-glow">
                <FaDownload /> Open Google Doc Resume
              </a>
              <button className="btn-secondary" onClick={() => setMode('choice')}>
                Back to Options
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
                and clinical AI models (<b>PPEMDD</b>). Proficient in React, Node.js, Flask, PyTorch, and multimodal attention networks.
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
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="btn-main-accent">
              View Official PDF / Google Doc <FaArrowRight />
            </a>
            <button className="btn-arcade-launch" onClick={startBattle}>
              <FaGamepad /> Play Pokémon Battle
            </button>
          </div>
        </div>
      )}

      {/* 3. RETRO 2D POKÉMON BATTLE SCREEN */}
      {mode === 'battle' && (
        <div className="pokemon-battle-container">
          {/* Top Bar Navigation */}
          <div className="pokemon-topbar">
            <div className="poke-title">
              <FaBolt className="text-yellow-400" /> POKÉMON BATTLE MODE — TRAINER: <span>SAHIL PATHAK</span>
            </div>
            <div className="poke-top-actions">
              <button className="game-top-btn" onClick={() => setSoundOn(!soundOn)} title="Toggle Sound">
                {soundOn ? <FaVolumeHigh /> : <FaVolumeXmark />}
              </button>
              <button className="game-top-btn exit" onClick={() => setMode('choice')} title="Exit Battle">
                <FaXmark />
              </button>
            </div>
          </div>

          {/* Main 2D Battle Canvas Viewport */}
          <div className="pokemon-viewport">
            <canvas ref={canvasRef} className="pokemon-canvas" />

            {/* Boss HUD */}
            {!isOverworldState && battleSubState !== 'trainer_intro' && (
              <div className="poke-hud boss-hud">
                <div className="hud-name">
                  <span>MEGA CHARIZARD X</span>
                  <span className="lvl">Lv.100</span>
                </div>
                <div className="hp-bar-bg">
                  <div
                    className="hp-bar-fill boss"
                    style={{
                      width: `${(bossHp / maxBossHp) * 100}%`,
                      background: bossHp > 250 ? '#22c55e' : bossHp > 100 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <div className="hp-text">
                  HP: {bossHp} / {maxBossHp}
                </div>
              </div>
            )}

            {/* Player HUD */}
            {!isOverworldState && battleSubState !== 'trainer_intro' && battleSubState !== 'boss_sendout' && (
              <div className="poke-hud player-hud">
                <div className="hud-name">
                  <span>ASH-GRENINJA</span>
                  <span className="lvl">Lv.100</span>
                </div>
                <div className="hp-bar-bg">
                  <div
                    className="hp-bar-fill player"
                    style={{
                      width: `${(playerHp / maxPlayerHp) * 100}%`,
                      background: playerHp > 120 ? '#22c55e' : playerHp > 50 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <div className="hp-text">
                  HP: {playerHp} / {maxPlayerHp}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Battle Dialogue & Command Console */}
          <div className="pokemon-console">
            <div className="poke-dialog-box">
              <p>{dialogText}</p>
            </div>

            <div className="poke-menu-box">
              {isOverworldState && (
                <div className="intro-wait-badge">
                  <span>🌲 ROUTE 1 OVERWORLD ENCOUNTER...</span>
                </div>
              )}

              {!isOverworldState && (battleSubState === 'trainer_intro' || battleSubState === 'boss_sendout' || battleSubState === 'player_sendout') && (
                <div className="intro-wait-badge">
                  <span>⚔️ TRAINERS SENDING OUT POKÉMON...</span>
                </div>
              )}

              {battleSubState === 'menu' && (
                <div className="main-cmd-grid">
                  <button className="cmd-btn fight" onClick={() => setBattleSubState('moves')}>
                    ⚔️ FIGHT (SKILLS)
                  </button>
                  <button className="cmd-btn bag" onClick={() => handleUseMove(SKILL_MOVES[3])}>
                    🎒 RESTORE HP
                  </button>
                  <button className="cmd-btn resume-direct" onClick={() => setMode('resume')}>
                    📄 VIEW RESUME
                  </button>
                  <button className="cmd-btn run" onClick={() => setMode('choice')}>
                    🏃 RUN
                  </button>
                </div>
              )}

              {battleSubState === 'moves' && (
                <div className="moves-cmd-grid">
                  {SKILL_MOVES.map((move) => (
                    <button
                      key={move.name}
                      className="move-btn"
                      onClick={() => handleUseMove(move)}
                      style={{ borderLeftColor: move.col }}
                    >
                      <div className="move-title">
                        <b>{move.name}</b> <span className="skill-badge">{move.skill}</span>
                      </div>
                      <div className="move-desc">{move.desc}</div>
                    </button>
                  ))}
                  <button className="move-back-btn" onClick={() => setBattleSubState('menu')}>
                    ↩ BACK
                  </button>
                </div>
              )}

              {battleSubState === 'victory' && (
                <div className="victory-cmd-box">
                  <button className="victory-claim-btn" onClick={() => setMode('resume')}>
                    📄 CLAIM &amp; VIEW SAHIL&apos;S RESUME NOW 🎉
                  </button>
                  <button className="victory-replay-btn" onClick={startBattle}>
                    <FaRotateLeft /> REPLAY BATTLE
                  </button>
                </div>
              )}

              {battleSubState === 'defeated' && (
                <div className="victory-cmd-box">
                  <button className="victory-replay-btn" onClick={startBattle}>
                    <FaRotateLeft /> RETRY BATTLE
                  </button>
                  <button className="victory-claim-btn" onClick={() => setMode('resume')}>
                    📄 DIRECT RESUME ACCESS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
