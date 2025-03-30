import React from 'react'

const AiEcom = () => {
  const features = [
    "AI-powered product recommendations",
    "Smart search functionality",
    "Personalized user experience",
    "Dynamic pricing optimization",
    "Automated inventory management",
    "ChatBot customer support"
  ]

  const technologies = [
    "JavaScript",
    "CSS",
    "HTML",
    "TensorFlow.js",
    "Python",
    "Flask",
    "Machine Learning",
    "SQLITE"
  ]

  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-white text-4xl font-bold mb-8 text-center'>AI Ecommerce Platform</h1>
        
       
        <div className='bg-[#111111] bg-opacity-50 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-white mb-4'>Project Overview</h2>
          <p className='text-gray-300 leading-relaxed'>
            An advanced e-commerce platform that leverages artificial intelligence 
            to provide personalized shopping experiences. The system uses machine 
            learning algorithms to understand user preferences and optimize the 
            shopping journey.
          </p>
        </div>

       
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

   
        <div className='flex justify-center space-x-4'>
          <a 
            href="https://github.com/sahil454521/ai-ecommerce"
            target="_blank"
            rel="noopener noreferrer"
            className='bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
          >
            View Source Code
          </a>
          <a 
            href="https://www.linkedin.com/feed/update/urn:li:activity:7279894417535045633/"
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

export default AiEcom