import React from 'react'
import { IoLocationSharp } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FaGithubSquare,FaLinkedin  } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

const Card = () => {
  return (
    <div className='max-w-5xl mx-auto my-10 rounded-lg border border-gray-800 bg-opacity-0 backdrop-blur-sm p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-4'>
          <h4 className='text-white text-2xl font-bold'>Sahil Pathak</h4>
          <a href="mailto:your.sahilpathak2005@gmail.com">
            <IoIosMail className="text-[#b3b3b3] text-5xl hover:text-white transition-colors max-w-1xl rounded-lg border border-gray-800 p-2" /></a>
          <a href='https://github.com/sahil454521'><FaGithubSquare className='text-[#b3b3b3] text-5xl hover:text-white transition-colors max-w-1xl rounded-lg border border-gray-800 p-2'/></a>
          <a href='https://www.linkedin.com/in/sahil-pathak-98a523202/'><FaLinkedin className='text-[#b3b3b3] text-5xl hover:text-white transition-colors max-w-1xl rounded-lg border border-gray-800 p-2' /></a>
          <a href='https://www.instagram.com/sahilpathak.21/'><RiInstagramFill className='text-[#b3b3b3] text-5xl hover:text-white transition-colors max-w-1xl rounded-lg border border-gray-800 p-2' /></a>
        </div>
      </div>
      <div className='flex flex-col gap-4 text-[#b3b3b3] text-lg font-semibold'>
        <p className='flex items-center gap-2'>
          <IoLocationSharp /> 
          <span>Pune, Maharashtra, India</span>
        </p>
        <p className='text-white text-lg font-semibold'>
          I am a Full Stack Developer with a passion for creating dynamic and responsive web applications. I have experience in both front-end and back-end development, and I am always eager to learn new technologies and improve my skills.
        </p>
      </div> 
    </div>
  )
}

export default Card
