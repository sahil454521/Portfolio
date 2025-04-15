import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Import the images directly
import profileimage2 from '../assets/profile2.jpg'
import profileimage from '../assets/profile.jpg'

const Navbar = () => {
  // Use state to handle image loading errors and toggling
  const [profileSrc, setProfileSrc] = useState(profileimage2);
  const [isSecondProfile, setIsSecondProfile] = useState(true);
  
  // Handle image error
  const handleImageError = () => {
    console.warn('Profile image not found, using fallback');
    setProfileSrc('https://via.placeholder.com/150');
  };

  // Handle profile image toggle
  const toggleProfileImage = () => {
    if (isSecondProfile) {
      setProfileSrc(profileimage);
    } else {
      setProfileSrc(profileimage2);
    }
    setIsSecondProfile(!isSecondProfile);
  };

  return (
    <nav className="flex justify-between items-center py-6 bg-[#111111]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-8 h-8 sm:w-8 sm:h-8 md:w-16 md:h-16 rounded-full border-4 border-[#1a1a1a] overflow-hidden cursor-pointer transform transition duration-300 hover:scale-110"
            onClick={toggleProfileImage}
          >
            <img 
              src={profileSrc}
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        </div>
        
        <div className='flex space-x-4 sm:space-x-6'>
          <Link to="/Home" className="text-white hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/About" className="text-white hover:text-blue-400 transition-colors">About</Link>
          <Link to="/Projects" className="text-white hover:text-blue-400 transition-colors">Projects</Link>
          <a href='https://docs.google.com/document/d/13mbt09Y85GFBqK1XHz-hsDIynav9VCoxI2sYTTiSjNk/edit?usp=sharing' 
             className="text-white hover:text-blue-400 transition-colors"
             target="_blank" 
             rel="noopener noreferrer">Resume</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar