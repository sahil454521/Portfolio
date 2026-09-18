import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const YoutubeClone = () => {
  // State for tracking scroll position for navigation
  const [activeSection, setActiveSection] = useState('overview');
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Refs for each section
  const overviewRef = useRef(null);
  const featuresRef = useRef(null);
  const technologiesRef = useRef(null);
  const implementationRef = useRef(null);
  const learningsRef = useRef(null);

  // Observer for tracking scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = [
        { ref: overviewRef, id: 'overview' },
        { ref: featuresRef, id: 'features' },
        { ref: technologiesRef, id: 'technologies' },
        { ref: implementationRef, id: 'implementation' },
        { ref: learningsRef, id: 'learnings' }
      ];
      
      // Find the active section based on scroll position
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          
          // Calculate progress percentage
          const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress = (window.scrollY / scrollableHeight) * 100;
          setProgressPercentage(currentProgress);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    "Watch and stream videos seamlessly",
    "User-friendly interface with responsive design",
    "Personalized video recommendations",
    "Dynamic search functionality with real-time results",
    "Like, comment, and subscribe features",
    "Infinite scroll loading for continuous video discovery",
    "Trending videos section based on YouTube API data",
    "Video categories and filters"
  ]

  const technologies = [
    "React",
    "Redux",
    "YouTube API",
    "Tailwind CSS",
    "JavaScript ES6+",
    "Axios",
    "React Router",
    "LocalStorage"
  ]


  
  const navigationItems = [
    { id: 'overview', label: 'Project Overview' },
    { id: 'features', label: 'Key Features' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'implementation', label: 'Implementation' },
    { id: 'learnings', label: 'Learnings' }
  ];

  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16 relative'>
      {/* Side Navigation */}
      <div className='hidden lg:block fixed top-1/3 left-8 transform -translate-y-1/2 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl z-10'>
        <div className="mb-4">
          <h3 className="text-white text-lg font-medium mb-3">Project Navigation</h3>
          <div className="w-full bg-gradient-to-r from-red-500 to-red-700 h-0.5 rounded-full"></div>
        </div>
        
        <div className="relative">
          <div className="absolute left-[12px] top-0 w-0.5 h-full bg-gray-700"></div>
          
          <motion.div 
            className="absolute left-[12px] top-0 w-0.5 bg-gradient-to-b from-red-500 to-red-700" 
            initial={{ height: 0 }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
          
          <ul className='space-y-6 py-2'>
            {navigationItems.map((item) => (
              <li key={item.id} className="relative pl-8">
                <div 
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-red-500 to-red-700' 
                      : 'bg-gray-800 border-2 border-gray-700'
                  }`}
                >
                  {activeSection === item.id && (
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  )}
                </div>
                <a 
                  href={`#${item.id}-section`} 
                  className={`transition-colors duration-300 ${
                    activeSection === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='max-w-4xl mx-auto pb-24'>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-white text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700'
        >
          YouTube Clone
        </motion.h1>
        
        {/* Project Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          ref={overviewRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="overview-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Project Overview</h2>
          <p className='text-gray-300 leading-relaxed mb-4'>
            This YouTube Clone project replicates the core functionalities of YouTube's front-end interface, 
            built as part of my learning journey with React and API integration. The application leverages the 
            YouTube Data API to fetch and display real videos, allowing users to search, view, and interact with content.
          </p>
          <p className='text-gray-300 leading-relaxed mb-4'>
            The project focuses on creating a responsive and intuitive user interface similar to YouTube, 
            implementing features like infinite scroll for continuous content discovery, video recommendations, 
            and search functionality. While primarily a front-end learning exercise, it demonstrates practical 
            skills in working with external APIs and creating seamless user experiences.
          </p>
          
          {/* Demo Screenshot */}
          <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-gray-400 text-sm">YouTube Clone</span>
              </div>
            </div>
            <div className="aspect-video bg-gray-900 p-6">
              <div className="flex h-full bg-black rounded-lg overflow-hidden">
                <div className="w-1/6 bg-gray-900 h-full px-2 py-4">
                  <div className="flex items-center mb-6 px-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                    <div className="ml-2 text-white text-sm font-medium">YouTube</div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(item => (
                      <div key={item} className="px-4 py-2 rounded-lg flex items-center text-gray-400 text-xs">
                        <div className="w-4 h-4 mr-3 bg-gray-700"></div>
                        <span>Menu Item {item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-5/6 p-4">
                  <div className="mb-4">
                    <div className="bg-gray-800 rounded-full h-10 flex items-center px-4">
                      <div className="flex-1 h-5 bg-gray-700 rounded"></div>
                      <div className="w-10 h-6 bg-gray-700 ml-2 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(item => (
                      <div key={item} className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-700"></div>
                        <div className="p-2">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div className="mt-6 flex justify-center space-x-4">
            <a
              href="https://github.com/sahil454521/Youtube"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 text-sm inline-flex items-center bg-gray-800 px-4 py-2 rounded-md transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source Code
            </a>
            <a
              href="https://youtube-q0wgesd34-sahilpathak2005-gmailcoms-projects.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              View Live Demo
            </a>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          ref={featuresRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="features-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Key Features</h2>
          <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className='text-gray-300 flex items-start'
              >
                <span className='text-red-400 mr-3 text-xl'>→</span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          {/* Feature Showcase */}
          <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex flex-col space-y-6">
              {/* Feature: Video Search */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Search Functionality
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-4 bg-white rounded-full overflow-hidden">
                    <input type="text" placeholder="Search videos..." className="flex-1 px-4 py-2 text-gray-800 text-sm outline-none" />
                    <button className="bg-gray-100 border-l border-gray-300 h-full px-4">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-xs text-gray-400">When users type:</div>
                      <ul className="mt-1">
                        <li className="text-white text-sm">• Real-time search suggestions</li>
                        <li className="text-white text-sm">• History-based recommendations</li>
                        <li className="text-white text-sm">• Instant results as you type</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-xs text-gray-400">Search results include:</div>
                      <ul className="mt-1">
                        <li className="text-white text-sm">• Videos from YouTube API</li>
                        <li className="text-white text-sm">• Thumbnails and metadata</li>
                        <li className="text-white text-sm">• Channel information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Feature: Infinite Scrolling */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Infinite Scroll Loading
                </h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[1, 2, 3, 4].map(item => (
                      <div key={item} className="bg-gray-700 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-600"></div>
                        <div className="p-2">
                          <div className="h-4 bg-gray-600 rounded mb-1"></div>
                          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center py-3 border-t border-gray-700">
                    <div className="w-8 h-8">
                      <svg className="animate-spin text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 6].map(item => (
                      <div key={item} className="bg-gray-700 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-600"></div>
                        <div className="p-2">
                          <div className="h-4 bg-gray-600 rounded mb-1"></div>
                          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technologies Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          ref={technologiesRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="technologies-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Technologies Used</h2>
          <div className='flex flex-wrap gap-3'>
            {technologies.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className='bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md'
              >
                {tech}
              </motion.span>
            ))}
          </div>
          
          <div className='mt-6 text-gray-300 leading-relaxed'>
            <p className='mb-3'>
              The YouTube Clone project is built primarily with React for the front-end interface, using 
              Redux for state management. The YouTube Data API is integrated to fetch and display real video content, 
              while Tailwind CSS provides responsive styling.
            </p>
            
            <div className="mt-8 bg-gray-900 rounded-lg p-5 border border-gray-700">
              <h3 className="text-white text-lg font-medium mb-4">Technology Stack</h3>
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-red-400 text-center font-medium mb-2">Frontend</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">React</div>
                          <div className="text-gray-400 text-xs">UI Components</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Redux</div>
                          <div className="text-gray-400 text-xs">State Management</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Tailwind CSS</div>
                          <div className="text-gray-400 text-xs">Styling</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-700"></div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-red-400 text-center font-medium mb-2">External APIs & Services</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">YouTube API</div>
                          <div className="text-gray-400 text-xs">Data Source</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Axios</div>
                          <div className="text-gray-400 text-xs">HTTP Client</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">LocalStorage</div>
                          <div className="text-gray-400 text-xs">Data Persistence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Implementation Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          ref={implementationRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="implementation-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Implementation Details</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            The YouTube Clone implementation focuses on API integration, efficient data handling, 
            and creating an intuitive user interface. Here are the key implementation details:
          </p>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>1. YouTube API Integration</h3>
              <p className='mb-2'>
                The application uses the YouTube Data API to fetch videos, search results, and metadata.
                API calls are optimized to minimize quota usage while providing a seamless user experience.
              </p>
            </div>
            
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>2. Redux State Management</h3>
              <p className='mb-2'>
                The application state is managed centrally with Redux, handling video data, search results, 
                user preferences, and loading states. This provides a consistent data flow throughout the application.
              </p>
            </div>
            
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>3. Responsive UI with Tailwind CSS</h3>
              <p className='mb-2'>
                The interface is fully responsive using Tailwind CSS, adapting to different screen sizes
                and maintaining YouTube's familiar layout and user experience across devices.
              </p>
            </div>
          </div>

          {/* Code Snippets */}
          <div className="mt-8">
            <h3 className="text-white text-lg font-medium mb-4">Code Examples</h3>
            <div className="space-y-6">
              {codeSnippets.map((snippet, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                    <h4 className="text-white font-medium">{snippet.title}</h4>
                    <span className="text-xs text-gray-400 uppercase">{snippet.language}</span>
                  </div>
                  <div className="bg-gray-900 p-4 overflow-x-auto">
                    <pre className="text-gray-300 text-sm"><code>{snippet.code}</code></pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-red-900/20 rounded-lg p-4 border border-red-800/40">
            <h3 className="text-red-300 font-medium mb-2">Implementation Notes</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Used Intersection Observer for implementing infinite scrolling</li>
              <li>• Debounced search inputs to optimize API calls</li>
              <li>• Cached frequently accessed data to improve performance</li>
              <li>• Implemented error boundaries to handle API failures gracefully</li>
              <li>• Used lazy loading for video thumbnails to improve initial load times</li>
            </ul>
          </div>
        </motion.div>

        {/* Learnings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          ref={learningsRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="learnings-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Learnings & Challenges</h2>
          <p className='text-gray-300 leading-relaxed mb-4'>
            As a learning project, building this YouTube Clone provided valuable experience in several areas
            of front-end development. Here are the key learnings and challenges faced:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h3 className="text-white text-lg font-medium mb-3">Key Learnings</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-300">Working with external APIs and handling API quotas efficiently</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-300">Implementing infinite scrolling and optimizing performance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-300">Using Redux for global state management across components</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                  </svg>
                  <span className="text-gray-300">Creating a responsive design that mimics YouTube's interface</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h3 className="text-white text-lg font-medium mb-3">Challenges Faced</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2V6H9v3zM9 14h2v-2H9v2z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-300">YouTube API quota limitations requiring optimization</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2V6H9v3zM9 14h2v-2H9v2z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-300">Implementing efficient infinite scroll without performance issues</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2V6H9v3zM9 14h2v-2H9v2z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-300">Managing complex state transitions between search and video viewing</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2V6H9v3zM9 14h2v-2H9v2z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-300">Responsive design for a component-rich interface across devices</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-white text-lg font-medium mb-3">Future Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <h4 className="text-red-400 text-sm font-medium mb-2">Technical Improvements</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Add video upload functionality
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Implement user authentication
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Add comment posting capability
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Improve caching for offline capabilities
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <h4 className="text-red-400 text-sm font-medium mb-2">UX Improvements</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Enhance video player controls
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Add channel subscription feature
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Implement video history tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    Add playlist creation functionality
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <a
              href="https://github.com/sahil454521/Youtube"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View full project on GitHub for more implementation details
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default YoutubeClone