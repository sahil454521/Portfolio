import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function FootstepsAnimation() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return

    const feetEls = []
    const feetPositions = []

    const pointer = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      angle: 0,
      moving: false,
      justStopped: false,
    }

    const stepsNumber = 9
    const iconSize = 50
    const mouseRepel = 35

    let stepsCnt = 0
    let accumDx = 0
    let accumDy = 0
    let accumDist = 0
    let introAnimationIsPlaying = false
    let animFrameId = null
    let introTimeline = null

    const updateLayout = () => {
      if (svgEl) {
        svgEl.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`)
      }
    }

    const createFeet = () => {
      const existingUseElements = svgEl.querySelectorAll('use.footstep-el')
      existingUseElements.forEach((el) => el.remove())

      feetEls.length = 0
      feetPositions.length = 0

      for (let i = 0; i < stepsNumber; i++) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        el.setAttribute('class', 'footstep-el')
        el.setAttribute('href', i % 2 ? '#feet-left' : '#feet-right')
        el.setAttribute('x', `${-0.5 * iconSize}`)
        el.setAttribute('y', `${-0.5 * iconSize}`)
        el.setAttribute('width', `${iconSize}`)
        el.setAttribute('height', `${iconSize}`)
        svgEl.appendChild(el)

        feetPositions.push({ x: 0, y: 0, angle: 0, age: 0 })
        feetEls.push(el)

        gsap.set(el, {
          opacity: 0,
          transformOrigin: 'center center',
        })
      }
    }

    const updateFootEl = (el, posIdx, isLeft, delay = 0) => {
      if (!el || !feetPositions[posIdx]) return
      gsap.set(el, {
        delay: delay,
        x: feetPositions[posIdx].x,
        y: feetPositions[posIdx].y,
        rotation: feetPositions[posIdx].angle,
        attr: {
          href: isLeft ? '#feet-left' : '#feet-right',
        },
      })
    }

    const onPointerMove = (x, y) => {
      pointer.dx = x - pointer.x
      pointer.dy = y - pointer.y
      pointer.x = x
      pointer.y = y
      pointer.moving = true

      accumDx += pointer.dx
      accumDy += pointer.dy
      pointer.angle = Math.atan2(pointer.dx, pointer.dy)
      accumDist = Math.sqrt(Math.pow(accumDx, 2) + Math.pow(accumDy, 2))

      if (accumDist > 70) {
        stepsCnt++
        accumDx = 0
        accumDy = 0
        accumDist = 0

        feetPositions.unshift({
          x: pointer.x,
          y: pointer.y,
          angle: (1 - pointer.angle / Math.PI) * 180,
          age: 1,
        })
        feetPositions.length = stepsNumber

        feetPositions[0].x -= Math.sin(pointer.angle) * mouseRepel
        feetPositions[0].y -= Math.cos(pointer.angle) * mouseRepel

        for (let fIdx = 1; fIdx < stepsNumber; fIdx++) {
          if (feetEls[fIdx]) {
            updateFootEl(feetEls[fIdx], fIdx, fIdx % 2 === stepsCnt % 2)
          }
        }

        if (feetEls[0]) {
          gsap.set(feetEls[0], { opacity: 0 })
        }
      }
    }

    const render = () => {
      for (let fIdx = 1; fIdx < stepsNumber; fIdx++) {
        if (feetPositions[fIdx]) {
          feetPositions[fIdx].age -= pointer.moving ? 0.05 : 0.1
        }
      }

      for (let fIdx = 2; fIdx < stepsNumber; fIdx++) {
        if (feetEls[fIdx] && feetPositions[fIdx]) {
          gsap.set(feetEls[fIdx], {
            opacity: Math.max(0, feetPositions[fIdx].age),
          })
        }
      }

      if (pointer.moving) {
        pointer.moving = false
        pointer.justStopped = true
      } else if (pointer.justStopped) {
        pointer.justStopped = false

        if (feetEls[0]) {
          updateFootEl(feetEls[0], 0, 0 === stepsCnt % 2)
          gsap.set(feetEls[0], { opacity: 1 })
        }

        if (feetEls[1]) {
          updateFootEl(feetEls[1], 0, 1 === stepsCnt % 2, 0.1)
          gsap.set(feetEls[1], { delay: 0.1, opacity: 1 })
        }

        for (let fIdx = 2; fIdx < stepsNumber; fIdx++) {
          if (feetEls[fIdx]) {
            updateFootEl(feetEls[fIdx], fIdx - 1, (fIdx - 1) % 2 === stepsCnt % 2)
          }
        }
      }

      animFrameId = requestAnimationFrame(render)
    }

    const introAnimation = () => {
      introAnimationIsPlaying = true
      const mouseCoords = { x: -100, y: window.innerHeight }
      introTimeline = gsap.timeline({
        onUpdate: () => {
          onPointerMove(mouseCoords.x, mouseCoords.y)
        },
        onComplete: () => {
          introAnimationIsPlaying = false
        },
      })
      introTimeline
        .to(mouseCoords, {
          x: 0.4 * window.innerWidth,
          duration: 1.4,
          ease: 'power1.out',
        })
        .to(
          mouseCoords,
          {
            y: 0.6 * window.innerHeight,
            duration: 1.4,
            ease: 'back.out(3)',
          },
          0
        )
    }

    const handleMouseMove = (e) => {
      if (!introAnimationIsPlaying) {
        onPointerMove(e.clientX, e.clientY)
      }
    }

    const handleTouchMove = (e) => {
      if (!introAnimationIsPlaying && e.targetTouches && e.targetTouches[0]) {
        onPointerMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    createFeet()
    render()
    introAnimation()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId)
      if (introTimeline) introTimeline.kill()
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      const existingUseElements = svgEl.querySelectorAll('use.footstep-el')
      existingUseElements.forEach((el) => el.remove())
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="footsteps-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <defs>
        {/* Left foot definition */}
        <g id="feet-left">
          {/* Main Sole */}
          <path
            d="M 22,44 C 16,44 13,38 13,31 C 13,24 15,20 15,17 C 15,13 12,11 14,8 C 16,5 23,5 28,8 C 32,10 31,15 28,21 C 25,26 24,30 25,36 C 26,41 25,44 22,44 Z"
            fill="currentColor"
          />
          {/* Toes (left foot: small toe left, big toe right) */}
          <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="19" cy="6.5" r="1.8" fill="currentColor" />
          <circle cx="23" cy="4.5" r="2.2" fill="currentColor" />
          <circle cx="28" cy="3.8" r="2.6" fill="currentColor" />
          <circle cx="34" cy="4.5" r="3.4" fill="currentColor" />
        </g>
        {/* Right foot definition (mirrored horizontally) */}
        <g id="feet-right" transform="translate(50, 0) scale(-1, 1)">
          <use href="#feet-left" />
        </g>
      </defs>
    </svg>
  )
}
