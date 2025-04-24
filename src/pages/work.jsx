import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CompactWorkExperience = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 mb-16"
    >
      <h2 className="text-white text-2xl font-bold mb-6">
        Work Experience
      </h2>
      
      <motion.div 
        className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-lg transition-all duration-300"
        whileHover={{ y: -3, boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.2)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="relative w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                {/* Hollow circle with dot in center */}
                <div className="w-2 h-2 bg-white rounded-full"></div>
                {/* Pulsing animation circle */}
                <motion.div 
                  className="absolute inset-0 rounded-full border border-white"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AMG Projects</h3>
              <p className="text-gray-400 text-sm">Frontend Developer Intern</p>
            </div>
          </div>
          <span className="bg-[#222222] text-gray-300 py-1 px-3 rounded-md text-sm inline-block w-fit">
            3 Months
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-5 max-w-3xl">
          Developed AI-powered project cost estimator tool and redesigned success metrics visualization using React & Tailwind CSS.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-[#222222] text-gray-300 px-3 py-1 rounded-md text-sm">React</span>
          <span className="bg-[#222222] text-gray-300 px-3 py-1 rounded-md text-sm">Tailwind</span>
          <span className="bg-[#222222] text-gray-300 px-3 py-1 rounded-md text-sm">UI/UX</span>
          <span className="bg-[#222222] text-gray-300 px-3 py-1 rounded-md text-sm">Data Viz</span>
        </div>

        <div className="flex justify-between items-center">
          <Link 
            to="/AMGExperience" 
            className="text-white text-sm flex items-center hover:underline transition-all group"
          >
            View experience
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CompactWorkExperience