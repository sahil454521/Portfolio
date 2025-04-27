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
      <h2 className="text-white text-2xl font-bold mb-8">
        Work Experience
      </h2>
      <div className="relative flex flex-col gap-16">
        {/* First Experience */}
        <div className="flex flex-row items-start">
          {/* Timeline */}
          <div className="flex flex-col items-center mr-6">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-[#1a1a1a] flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              {/* Animated vertical line */}
              <motion.div
                className="absolute left-1/2 top-full w-1 bg-white"
                style={{ x: "-50%" }}
                initial={{ height: 0 }}
                animate={{ height: 80 }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          {/* Info */}
          <div>
            <Link 
              to="/AMGExperience" 
              className="text-white text-lg font-semibold flex items-center hover:underline transition-all group"
            >
              AMG Turkey Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path/>
              </svg>
            </Link>
            <div className="flex ite-left text-gray-400 text-sm mb-1">Frontend Developer Intern <span className="ml-2 text-gray-500">| 3 Months</span></div>
            <div className="text-gray-500 text-sm mb-2">
              Developed AI-powered project cost estimator tool and redesigned success metrics visualization using React & Tailwind CSS.
            </div>
  
          </div>
        </div>
        {/* Second Experience */}
        <div className="flex flex-row items-start">
          {/* Timeline */}
          <div className="flex flex-col items-center mr-6">
            <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>
          </div>
          {/* Info */}
          <div>
            <span className="flex text-gray-400 font-bold text-lg">Still Finding</span>
            <div className="text-gray-500 text-sm mb-1">Next opportunity awaits...</div>
            <span className="bg-[#222222] text-gray-400 py-1 px-3 rounded-md text-xs">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CompactWorkExperience