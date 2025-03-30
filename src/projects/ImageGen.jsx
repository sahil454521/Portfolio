import React from 'react'

const ImageGen = () => {
  const features = [
    "Generate high-quality images",
    "User-friendly interface",
    "Personalized user experience",
    "Dynamic optimization"
  ]

  const technologies = [
    "Python",
    "TensorFlow",
    "HUggingFace",
    "Machine Learning",
    "Kaggle",
    "tinkert",
    "Torch"
  ]

  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-white text-4xl font-bold mb-8 text-center'>AI Image Generator</h1>


        <div className='bg-[#111111] bg-opacity-50 rounded-lg p-6 mb-8'>
          <h2 className='text-2xl font-bold text-white mb-4'>Project Overview</h2>
          <p className='text-gray-300 leading-relaxed'>
            This project gives a Generative Adversarial Network (GAN) to generate images based on input data. The model is trained on a various dataset, producing realistic images.
            The App.py integrates the GAN model, allowing users to generate images interactively.
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
            href="https://github.com/sahil454521/LLM"
            target="_blank"
            rel="noopener noreferrer"
            className='bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
          >
            View Source Code
          </a>
          <a
            href="https://www.linkedin.com/feed/update/urn:li:activity:7251482743711186946/"
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

export default ImageGen