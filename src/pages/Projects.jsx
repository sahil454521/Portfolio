import React from 'react'
import { Link } from 'react-router-dom'
import projectImage1 from '../assets/p1.png'
import projectImage from '../assets/p2.png'
import projectImage2 from '../assets/p3.png'
import projectImage3 from '../assets/ai-terminal.png'


const Projects = () => {
  const projects = [
    {
      title: "AI E-Commerce",
      description: "An AI-powered e-commerce platform that provides personalized shopping experiences.",
      link: "/ai-ecom",
      image: projectImage,
      tech: ["React", "Node.js", "TensorFlow"]
    },
    {
      title: "AI Image Generator",
      description: "A GAN-based image generator that creates high-quality images based on input data.",
      link: "/image-gen",
      image: projectImage1,
      tech: ["Python", "PyTorch", "GAN"]
    },
    {
      title: "AI-Terminal",
      description: "A Platform where you can use deepseek for chatting and url analysis.",
      link: "/Aiterminal",
      image: projectImage3,
      tech: ["React", "Node.js", "NLP"]
    },
    {
      title: "YouTube Clone",
      description: "A YouTube-like platform with video streaming, recommendations, and user interactions.",
      link: "/youtube-clone",
      image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      tech: ["React", "Firebase", "Redux"]
    },
  ]

  return (
    <div className='bg-gradient-to-b from-[#111111] to-[#1a1a1a] min-h-screen py-16 px-4'>
      <div className="max-w-6xl mx-auto">
        <h1 className='text-white text-5xl font-bold mb-2 text-center'>My Projects</h1>
        <p className='text-gray-400 text-center mb-12 text-xl'>A showcase of my recent work and experiments</p>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8'>
          {projects.map((project, index) => (
            <div
              key={index}
              className='bg-[#222222] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800'
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <h2 className='text-white text-2xl font-bold mb-3'>{project.title}</h2>
                <p className='text-gray-300 mb-4'>{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <Link
                  to={project.link}
                  className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-blue-500/20'
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Projects
