import React from 'react'
import projectImage1 from '../assets/p1.png'
import projectImage from '../assets/p2.png'
import projectImage2 from '../assets/p3.png'
import projectImage3 from '../assets/ai-terminal.png'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion' // You'll need to install framer-motion

const Myprojects = () => {
  const projects = [
    {
      id: 1,
      title: 'Image-Generator',
      imageUrl: projectImage1,
      projectUrl: '/Image-gen',
      description: 'An AI-powered image generation project'
    },
    {
      id: 2,
      title: 'Ai-Ecommerce Store',
      imageUrl: projectImage,
      projectUrl: '/Ai-Ecom',
      description: 'An AI-powered ecommerce store project'
    },
    {
      id: 3,
      title: 'AI-Terminal',
      imageUrl: projectImage3,
      projectUrl: '/Aiterminal',  // Fixed the path - removed dot and added leading slash
      description: 'A platform where you can use deepseek for chatting and URL analysis'
    },
    // {
    //   id: 4,
    //   title: 'Youtube-Clone',
    //   imageUrl: projectImage2,
    //   projectUrl: '/Youtube-clone',
    //   description: 'A Youtube clone project with focus on video streaming and user interaction'
    // },
  ]

  return (
    <div className='mx-auto max-w-7xl px-4 py-16'>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'
      >
        {projects.map((project, index) => (
          <motion.div 
            key={project.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" 
            }}
            className='group bg-gray-900 bg-opacity-70 rounded-xl p-6 shadow-lg border border-gray-800'
          >
            <Link to={project.projectUrl} className="block">
              <div className='aspect-video overflow-hidden rounded-xl mb-4'>
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={project.imageUrl} 
                  alt={project.title} 
                  className='w-full h-full object-cover'
                />
              </div>
              
              <div className="relative">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 0.8 }}
                  className="h-[1px] bg-gradient-to-r from-blue-500 to-purple-500 mb-3"
                />
                
                <h2 className='text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300'>
                  {project.title}
                </h2>
                
                <p className='text-gray-300 mt-3 text-base leading-relaxed'>
                  {project.description}
                </p>
                
                <div className="mt-4 flex justify-end">
                  <motion.span 
                    whileHover={{ x: 5 }}
                    className="text-blue-400 font-medium flex items-center"
                  >
                    View Project
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Myprojects
