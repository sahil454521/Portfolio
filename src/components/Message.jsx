import React, { useState } from 'react'
import BlurFade from './BlurFade'
import { BLUR_FADE_DELAY } from '../config/constants'
import PlaceholdersAndVanishInput from './PlaceholdersAndVanishInput'
import { motion } from 'framer-motion'

const Message = () => {
  const [name, setName] = useState('')
  const [mail, setMail] = useState('')
  const [isInputLoading, setIsInputLoading] = useState(false)
  const [triggerDisappear, setTriggerDisappear] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const namePlaceholders = ["Your name", "How should we call you?"]
  const messagePlaceholders = [
    "Share your thoughts...",
    "Got an idea? Let's hear it!",
    "Want to collaborate?",
    "Drop your message here..."
  ]

  const handleNameChange = (e) => setName(e.target.value)
  const handleChange = (e) => setMail(e.target.value)

  const onSubmit = async () => {
    if (!name || !mail) return
    
    setIsInputLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTriggerDisappear(true)
      setIsSubmitted(true)
      setName('')
      setMail('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsInputLoading(false)
    }
  }

  return (
    <motion.section 
      id="reach"
      className="min-h-screen-[50vh] bg-gradient-to-b from-[#111111] to-[#1a1a1a] py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-6xl">
        <BlurFade delay={BLUR_FADE_DELAY * 16}>
          <div className="space-y-9 backdrop-blur-lg bg-black/30 rounded-2xl p-8 shadow-xl">
            <div className="text-center space-y-4">
              <motion.div 
                className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Connect 🚀
              </motion.div>
              
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Get in Touch
              </h2>
              
              <p className="mx-auto max-w-2xl text-gray-300 text-lg leading-relaxed">
                Whether you want to discuss AI/ML projects, explore blockchain possibilities,
                or just share ideas - I'm all ears. Let's create something amazing together!
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3 w-full">
                  <PlaceholdersAndVanishInput
                    type="text"
                    placeholders={namePlaceholders}
                    value={name}
                    onChange={handleNameChange}
                    onSubmit={onSubmit}
                    disabled={isInputLoading}
                    roundedLeft
                    triggerDisappear={triggerDisappear}
                  />
                </div>
                <div className="sm:w-2/3 w-full">
                  <PlaceholdersAndVanishInput
                    type="text"
                    placeholders={messagePlaceholders}
                    value={mail}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                    disabled={isInputLoading}
                    submitButton 
                    roundedRight
                    triggerDisappear={triggerDisappear}
                  />
                </div>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-green-400 font-medium text-center"
                >
                  Thanks for reaching out! I'll get back to you soon.
                </motion.div>
              )}
            </div>

            <div className="flex justify-center space-x-8">
              <motion.a 
                href="https://github.com/sahil454521"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </motion.a>

              <motion.a 
                href="https://www.linkedin.com/in/sahil-pathak-98a523202/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>
            </div>
          </div>
        </BlurFade>
      </div>
    </motion.section>
  )
}

export default Message
