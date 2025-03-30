import React from 'react'
import { Link } from 'react-router-dom'
import About from '../Pages/About'
const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-6 bg-[#111111]">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className='font-bold text-white '>Sahil Pathak</h1>
        <div className='flex space-x-6'>
        <Link to="/Home" className="text-white">Home</Link>
          <Link to="/About" className="text-white">About</Link>
          <Link to="/Projects" className="text-white">Projects</Link>
          <a href='https://docs.google.com/document/d/13mbt09Y85GFBqK1XHz-hsDIynav9VCoxI2sYTTiSjNk/edit?usp=sharing' className="text-white">Resume</a>
        </div>
      </div>

    </nav>
  )
}

export default Navbar
