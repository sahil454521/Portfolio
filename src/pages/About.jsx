import React from 'react';
import { motion } from 'framer-motion';
import profileimage from '../assets/profile.jpg'; 
import resume from '../assets/resume-sahil.pdf'; // Example resume file
import profileimage2 from '../assets/profile2.jpg';

const About = () => {
  // Skills data structured by categories
  const skills = {
    frontend: ['React', 'JavaScript', 'HTML5', 'CSS3/SCSS', 'Tailwind CSS', 'Redux'],
    backend: ['Node.js', 'Express', 'MongoDB', 'Firebase'],
    tools: ['Git/GitHub', 'VS Code', 'Figma', 'Adobe XD', 'Webpack'],
    ai: ['TensorFlow', 'PyTorch', 'Natural Language Processing', 'Computer Vision']
  };

  // Education details
  const education = [
    {
      degree: 'B.Tech in Computer Science',
      institution: 'Your University Name',
      duration: '2023 - 2027',
      description: 'Focusing on artificial intelligence, web development, and software engineering principles.'
    },
    {
      degree: 'Bachelor of science(Hons) in Artificial Intelligence and datascience',
      institution: 'Indian Institute of Technology (IIT),Ghuwati', 
      duration: '2023-2027',
      description: 'Specialized training in Data-science and AI model development.'
    }
  ];


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Scroll animations
  const scrollProgressVariants = {
    hidden: { scaleY: 0, originY: 0 },
    visible: { 
      scaleY: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-[#111111] min-h-screen text-gray-200 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero section */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About Me
          </motion.h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A passionate developer focused on creating impactful AI-powered web experiences with modern technologies.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Bio section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="bg-[#1a1a1a] rounded-xl p-8 shadow-xl border border-gray-800/50 mb-10"
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">My Journey</h2>
              
              <div className="space-y-6 text-gray-300">
                <p>
                  I'm a computer science student and developer with a strong interest in artificial intelligence and web development. My journey began with simple HTML pages and has evolved to creating complex, AI-integrated web applications.
                </p>
                
                <p>
                  With a strong foundation in both frontend and backend technologies, I specialize in building applications that leverage the power of AI to deliver exceptional user experiences. I'm particularly fascinated by the intersection of machine learning and user-facing applications.
                </p>
                
                <p>
                  When I'm not coding, I enjoy staying updated with the latest tech trends, contributing to open-source projects, and exploring new technologies that can enhance my development skills.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <a 
                  href="https://github.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 transition-colors duration-300 rounded-full text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/in/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 transition-colors duration-300 rounded-full text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="mailto:sahilpathak2005@gmail.com"
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 transition-colors duration-300 rounded-full text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Email
                </a>
              </div>
            </motion.div>
            
            {/* Education section */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1a1a1a] rounded-xl p-8 shadow-xl border border-gray-800/50 mb-10"
            >
              <h2 className="text-3xl font-bold mb-6 text-white">Education</h2>
              
              <div className="space-y-8">
                {education.map((edu, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    className="relative pl-8 pb-8 last:pb-0 border-l border-gray-800 last:border-l-transparent"
                  >
                    <div className="absolute left-0 top-0 w-14 h-14 -translate-x-1/2 flex items-center justify-center">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                    
                    <div className="relative">
                      <span className="text-sm text-purple-400 font-medium">{edu.duration}</span>
                      <h3 className="text-xl font-bold text-white mt-1">{edu.degree}</h3>
                      <p className="text-blue-300">{edu.institution}</p>
                      <p className="mt-2 text-gray-400">{edu.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* About Me section */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1a1a1a] rounded-xl p-8 shadow-xl border border-gray-800/50"
            >
              <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <span className="text-2xl">🚀</span> About Me
              </h2>
              
              <div className="space-y-4">
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">🔭</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Currently working on:</span> AI-driven projects like the EVA Bot and SAO-inspired games.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">🌱</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Currently learning:</span> Advanced AI/ML concepts, Unreal Engine 5, and Full-Stack Development.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">👯</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Looking to collaborate on:</span> AI/ML projects, game development, and innovative web solutions.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">🤔</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Looking for help with:</span> Training large language models (LLMs) and interactive storytelling AI.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">💬</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Ask me about:</span> AI, ML, game design, or full-stack development.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">😄</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Pronouns:</span> He/Him</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <span className="text-xl text-blue-400 mr-3">⚡</span>
                  <div>
                    <p className="text-gray-300"><span className="text-white font-medium">Fun fact:</span> I love cooking, reading books, and playing the guitar!</p>
                  </div>
                </motion.div>
              </div>
              
              {/* Visual element to make this section more engaging */}
              <motion.div 
                variants={itemVariants} 
                className="mt-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-800/20"
              >
                <h3 className="text-xl font-semibold text-blue-300 mb-3">Current Focus</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full text-sm">AI Integration</span>
                  <span className="bg-purple-900/50 text-purple-200 px-3 py-1 rounded-full text-sm">Game Development</span>
                  <span className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm">Full-Stack Web</span>
                  <span className="bg-teal-900/50 text-teal-200 px-3 py-1 rounded-full text-sm">LLM Training</span>
                  <span className="bg-pink-900/50 text-pink-200 px-3 py-1 rounded-full text-sm">Interactive AI</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Right column - Skills and personal info */}
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Profile card */}
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-xl border border-gray-800/50">
              <div className="h-32 bg-gradient-to-r from-black-300 to-white relative">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full border-4 border-[#1a1a1a] overflow-hidden">
                    <img 
                      src={profileimage2} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      // Replace with your actual profile photo
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-14 p-6 text-center">
                <h3 className="text-2xl font-bold text-white">Sahil Pathak</h3>
                <p className="text-blue-400 mb-4">Fullstack Developer & AI Enthusiast</p>
                
                <div className="flex justify-center space-x-3 text-gray-300 text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    India
                  </span>
                  <span>|</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Available for work
                  </span>
                </div>
              </div>
            </div>
          
            {/* Skills section */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#1a1a1a] rounded-xl p-6 shadow-xl border border-gray-800/50"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">Technical Skills</h2>
              
              <div className="space-y-6">
                {Object.entries(skills).map(([category, skillList], index) => (
                  <motion.div 
                    key={category}
                    variants={itemVariants}
                  >
                    <h3 className="text-lg font-medium text-blue-400 mb-3 capitalize">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map(skill => (
                        <span 
                          key={skill} 
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Interests section */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#1a1a1a] rounded-xl p-6 shadow-xl border border-gray-800/50"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">Interests</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">•</span> 
                  AI & Machine Learning
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">•</span> 
                  Web Application Development
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">•</span> 
                  Open Source Contribution
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">•</span> 
                  Tech Blogging & Documentation
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">•</span> 
                  UI/UX Design
                </li>
              </ul>
            </motion.div>
            
            {/* Download CV button */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-xl p-6 shadow-xl border border-gray-800/50 text-center"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <a 
                href={resume}
                download
                className="inline-block w-full py-3 px-6 bg-gradient-to-r from-black-500 to-white-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Resume
                </div>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;