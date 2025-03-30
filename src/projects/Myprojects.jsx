import React from 'react'
import projectImage1 from '../assets/p1.png'
import projectImage from '../assets/p2.png'
import projectImage2 from '../assets/p3.png'
import { Link } from 'react-router-dom'

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
      id:2,
      title: 'Ai-Ecommerce Store',
      imageUrl: projectImage,
      projectUrl: '/Ai-Ecom',
      description: 'An AI-powered ecommerce store project'
    },
    {
      id: 3,
      title: 'Youtube-Clone',
      imageUrl: projectImage2,
      projectUrl:"/Youtube-clone",
      description: 'A Youtube clone project with a focus on video streaming and user interaction'
    },
  ]

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map(project => (
          <div key={project.id} className='group hover:scale-105 transition-transform duration-300 bg-gray-900 bg-opacity-50 rounded-lg p-4'>
            <Link to={project.projectUrl} className="block">
              <div className='aspect-video overflow-hidden rounded-lg'>
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className='w-full h-full object-contain'
                />
              </div>
              <h2 className='text-xl font-bold mt-3 text-white group-hover:text-blue-400'>
                {project.title}
              </h2>
              <p className='text-gray-300 mt-2 text-sm'>{project.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Myprojects
