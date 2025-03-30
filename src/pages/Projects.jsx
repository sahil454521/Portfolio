import React from 'react'
import { Link } from 'react-router-dom'

const Projects = () => {
  const projects = [
    {
      title: "AI E-Commerce",
      description: "An AI-powered e-commerce platform that provides personalized shopping experiences.",
      link: "/ai-ecom",
    },
    {
      title: "AI Image Generator",
      description: "A GAN-based image generator that creates high-quality images based on input data.",
      link: "/image-gen",
    },
    {
      title: "YouTube Clone",
      description: "A YouTube-like platform with video streaming, recommendations, and user interactions.",
      link: "/youtube-clone",
    },
  ]

  return (
    <div className='bg-[#111111] min-h-screen flex flex-col items-center py-16 px-4'>
      <h1 className='text-white text-4xl font-bold mb-8'>My Projects</h1>
      <div className='flex flex-wrap justify-center gap-6'>
        {projects.map((project, index) => (
          <div
            key={index}
            className='bg-[#222222] p-6 rounded-lg shadow-lg w-72 hover:scale-105 transition-transform duration-300'
          >
            <h2 className='text-white text-xl font-semibold mb-2'>{project.title}</h2>
            <p className='text-[#b3b3b3] mb-4'>{project.description}</p>
            <Link
              to={project.link}
              className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
            >
              View Project
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects
