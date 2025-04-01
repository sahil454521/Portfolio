import React from 'react'

const YoutubeClone = () => {
  const features = [
    "Watch and stream videos seamlessly",
    "User-friendly interface with responsive design",
    "Personalized video recommendations",
    "Dynamic search functionality",
    "Like, comment, and subscribe features"
  ]

  const technologies = [
    "React",
    "Redux",
    "YouTube API",
    "Tailwind CSS",
    "Node.js",
    "Express.js"
  ]

  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-white text-4xl font-bold mb-8 text-center'>YouTube Clone</h1>

        {/* Project Overview */}
        <div className='bg-[#111111] bg-opacity-50 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-white mb-4'>Project Overview</h2>
          <p className='text-gray-300 leading-relaxed'>
            The YouTube Clone project replicates the core functionalities of YouTube, allowing users to watch, upload, and interact with videos. 
            It features a dynamic search bar, personalized recommendations, and a responsive design for seamless user experience across devices.
          </p>
        </div>

        {/* Key Features */}
        <div className='bg-[#111111] bg-opacity-50 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-white mb-4'>Key Features</h2>
          <ul className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {features.map((feature, index) => (
              <li key={index} className='text-gray-300 flex items-center'>
                <span className='text-blue-400 mr-2'>→</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Technologies Used */}
        <div className='bg-[#111111] bg-opacity-50 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-white mb-4'>Technologies Used</h2>
          <div className='flex flex-wrap gap-3'>
            {technologies.map((tech, index) => (
              <span
                key={index}
                className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm'
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className='flex justify-center space-x-4'>
          <a
            href="https://github.com/sahil454521/Youtube"
            target="_blank"
            rel="noopener noreferrer"
            className='bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
          >
            View Source Code
          </a>
          <a
            href="https://youtube-q0wgesd34-sahilpathak2005-gmailcoms-projects.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
          >
            Live Demo
          </a>
        </div>
      </div>
    </div>
  )
}

export default YoutubeClone