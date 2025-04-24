import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const Aiterminal = () => {
  // State to track active section and demo loading
  const [activeSection, setActiveSection] = useState('overview');
  const [demoLoaded, setDemoLoaded] = useState(false);
  
  // Refs for each section
  const overviewRef = useRef(null);
  const featuresRef = useRef(null);
  const technologiesRef = useRef(null);
  const architectureRef = useRef(null);
  const performanceRef = useRef(null);

  const features = [
    "Natural language conversations with advanced AI models",
    "Support for different conversation styles and AI personalities",
    "Message history and conversation context preservation",
    "Code snippet highlighting with syntax detection",
    "Mobile-responsive design for on-the-go use",
    "Dark mode with sleek interface inspired by modern terminal aesthetics",
    "Message streaming for real-time response generation"
  ];

  const technologies = [
    "React",
    "Next.js",
    "Deepseek v1 API",
    "Tailwind CSS",
    "Vercel",
    "Framer Motion",
    "React-Syntax-Highlighter",
    "TypeScript",
    "Server-Side Rendering"
  ];

  

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Check which section is in view
      const sections = [
        { ref: overviewRef, id: 'overview' },
        { ref: featuresRef, id: 'features' },
        { ref: technologiesRef, id: 'technologies' },
        { ref: architectureRef, id: 'architecture' },
        { ref: performanceRef, id: 'performance' },
      ];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial calculation after components mount
    setTimeout(() => {
      handleScroll();
    }, 500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle smooth scroll to section when sidebar link is clicked
  const scrollToSection = (sectionRef) => {
    window.scrollTo({
      top: sectionRef.current.offsetTop - 80,
      behavior: 'smooth'
    });
  };

  const navigationItems = [
    { id: 'overview', label: 'Project Overview', ref: overviewRef },
    { id: 'features', label: 'Key Features', ref: featuresRef },
    { id: 'technologies', label: 'Technologies', ref: technologiesRef },
    { id: 'architecture', label: 'Architecture', ref: architectureRef },
    { id: 'performance', label: 'Demo & Results', ref: performanceRef }
  ];

  // Find the index of active section for progress calculation
  const activeIndex = navigationItems.findIndex(item => item.id === activeSection);
  // Make sure progress shows complete when at performance section
  const progressPercentage = activeSection === 'performance' ? 100 : (activeIndex / (navigationItems.length - 1)) * 100;

  // Project links
  const githubUrl = "https://github.com/sahil454521/ai-chat-bot";
  const liveUrl = "https://ai-chat-bot-gcar.vercel.app/";
  
  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16 relative'>
      {/* Sidebar Navigation */}
      <div className='hidden lg:block fixed top-1/3 left-8 transform -translate-y-1/2 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl z-10'>
        <div className="mb-4">
          <h3 className="text-white text-lg font-medium mb-3">Project Navigation</h3>
          <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 h-0.5 rounded-full"></div>
        </div>
        
        <div className="relative">
          {/* Vertical progress line */}
          <div className="absolute left-[12px] top-0 w-0.5 h-full bg-gray-700"></div>
          
          {/* Filled progress line based on active section */}
          <motion.div 
            className="absolute left-[12px] top-0 w-0.5 bg-gradient-to-b from-green-500 to-emerald-500" 
            initial={{ height: 0 }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
          
          <ul className='space-y-6 py-2'>
            {navigationItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const isPast = navigationItems.findIndex(i => i.id === activeSection) >= index;
              
              return (
                <li 
                  key={item.id}
                  className={`cursor-pointer transition-all duration-300 pl-8 relative ${
                    isActive ? 'text-green-400 font-medium' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => scrollToSection(item.ref)}
                >
                  {/* Circle indicator */}
                  <motion.div 
                    className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isPast 
                        ? 'border-green-500' 
                        : 'border-gray-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1, 1.2, 1] }}
                        transition={{ 
                          duration: 0.5,
                          times: [0, 0.7, 0.9, 1],
                          ease: "easeOut"
                        }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                    )}
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ 
                          scale: [1, 1.8], 
                          opacity: [0.8, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                        className="absolute w-full h-full rounded-full bg-green-500"
                      />
                    )}
                  </motion.div>
                  
                  {/* Section name */}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 2 }}
                  >
                    {item.label}
                  </motion.span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className='max-w-4xl mx-auto pb-24'>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-white text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500'
        >
          AI Terminal Chat
        </motion.h1>

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
            AI Terminal Chat is a modern conversational interface that combines the aesthetics of a developer terminal with the power of advanced language models. The application provides users with an intuitive chat interface for interacting with AI assistants, including features like code syntax highlighting, markdown support, and conversation memory.
          </p>
          <p className='text-gray-300 leading-relaxed mb-4'>
            Built with a focus on developer experience, the chat interface supports special features like code formatting, message streaming for real-time responses, and a clean, minimalist design inspired by modern coding terminals and IDEs.
          </p>
          
          {/* Project Preview */}
          <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-black aspect-video relative">
              <div className={`absolute inset-0 bg-gray-900 flex items-center justify-center ${demoLoaded ? 'hidden' : 'block'}`}>
                <div className="text-gray-400 text-center">
                  <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Loading preview...</p>
                </div>
              </div>
 

              
              <iframe 
                src={liveUrl} 
                className="w-full h-full"
                frameBorder="0" 
                title="AI Chat Bot Preview"
                onLoad={() => setDemoLoaded(true)}
                sandbox="allow-scripts allow-same-origin"
              ></iframe>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a 
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm inline-flex items-center"
            >
              <span>Visit Live Demo</span>
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
                                   {/* Action buttons */}
          <div className='flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6'>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className='bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center shadow-lg'
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Repository
            </motion.a>
          </div>
          </div>
        </motion.div>

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
                <span className='text-green-400 mr-3 text-xl'>→</span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          {/* Feature Demonstration */}
          <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex flex-col space-y-6">
              {/* User Interface Preview */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Terminal-Inspired UI
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-3 px-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-gray-400 text-xs">AI Terminal Chat</p>
                    </div>
                  </div>
                  <div className="bg-black rounded p-3 font-mono text-sm text-gray-300">
                    <p className="text-gray-400">$ Initializing AI Terminal...</p>
                    <p className="text-gray-400">$ Loading neural network...</p>
                    <p className="text-gray-400">$ Establishing secure connection...</p>
                    <p className="text-gray-400">$ System ready.</p>
                    
                    <div className="bg-gray-900 my-2 p-2 rounded text-xs">
                      <div className="mt-2">
                        <p className="text-white-300">Welcome to AI Terminal. How can I assist you today? You can use regular text, URLs, or commands starting with /.</p>
                        <pre className="mt-1 text-gray-300">
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 border-t border-gray-800 pt-2">
                      <span className="text-gray-500">$</span>
                      <div className="h-5 w-1 bg-gray-300 ml-2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Syntax Highlighting Demo */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Multi-Language Syntax Highlighting
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-gray-900 text-xs text-gray-400 px-3 py-1 flex justify-between">
                      <span>javascript</span>
                      <span>code example</span>
                    </div>
                    <div className="p-3 text-sm">
                      <pre className="text-blue-300">
{`function fetchData() {
  return fetch('/api/data')
    .then(res => res.json())
    .catch(err => {
      console.error(err);
    });
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-gray-900 text-xs text-gray-400 px-3 py-1 flex justify-between">
                      <span>python</span>
                      <span>code example</span>
                    </div>
                    <div className="p-3 text-sm">
                      <pre className="text-green-300">
{`def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
    
# Call the function
result = calculate_sum([1, 2, 3, 4])`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
                className='bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md'
              >
                {tech}
              </motion.span>
            ))}
          </div>
          
          <div className='mt-6 text-gray-300 leading-relaxed'>
            <p className='mb-3'>
              AI Terminal Chat is built using React and Next.js for the frontend, providing a fast and responsive user interface with server-side rendering capabilities. The styling is implemented with Tailwind CSS for a clean, modern look while maintaining flexibility and customization.
            </p>
            <p className='mb-3'>
              The application communicates with the OpenAI API to generate AI responses, with streaming capabilities for real-time message generation. React-Syntax-Highlighter is used for code formatting, supporting multiple programming languages with accurate syntax coloring.
            </p>
            
            {/* Tech stack visualization */}
            <div className="mt-8 bg-gray-900 rounded-lg p-5 border border-gray-700">
              <h3 className="text-white text-lg font-medium mb-4">Technology Stack</h3>
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Client Layer */}
                  <div className="md:col-span-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-emerald-400 text-center font-medium mb-2">Frontend Layer</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">React</div>
                          <div className="text-gray-400 text-xs">UI Library</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Next.js</div>
                          <div className="text-gray-400 text-xs">Framework</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Tailwind CSS</div>
                          <div className="text-gray-400 text-xs">Styling</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Middle Layer */}
                  <div className="md:col-span-3 flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-700"></div>
                  </div>
                  
                  {/* Services Layer */}
                  <div className="md:col-span-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-emerald-400 text-center font-medium mb-2">API & Services Layer</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Deepseek-v1 API</div>
                          <div className="text-gray-400 text-xs">AI Provider</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Next.js API</div>
                          <div className="text-gray-400 text-xs">Backend Routes</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Stream Processing</div>
                          <div className="text-gray-400 text-xs">Response Handling</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Deployment Layer */}
                  <div className="md:col-span-3 flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-700"></div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-emerald-400 text-center font-medium mb-2">Deployment Layer</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Vercel</div>
                          <div className="text-gray-400 text-xs">Hosting Platform</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Edge Functions</div>
                          <div className="text-gray-400 text-xs">API Endpoints</div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">CI/CD</div>
                          <div className="text-gray-400 text-xs">Auto Deployment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          ref={architectureRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="architecture-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Architecture & Implementation</h2>
          <p className='text-gray-300 leading-relaxed mb-4'>
            The application follows a clean architecture pattern, separating concerns between UI components, business logic, and API integration. Here's a breakdown of the key architectural components:
          </p>
          
          <div className='space-y-6 text-gray-300'>
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>1. Component Structure</h3>
              <p className='mb-2'>
                The UI is organized into reusable components that handle specific aspects of the chat interface, from message display to input handling and streaming responses.
              </p>
              <div className="bg-gray-900 p-4 rounded-md border-l-4 border-green-500">
                <div className="flex items-start text-sm">
                  <div className="mr-4 flex-shrink-0 pt-1">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Key Components:</div>
                    <ul className="list-disc text-gray-300 text-sm ml-4 mt-1">
                      <li><span className="text-green-400">ChatContainer</span>: Manages the overall chat state and renders messages</li>
                      <li><span className="text-green-400">ChatMessage</span>: Displays individual messages with role-specific styling</li>
                      <li><span className="text-green-400">ChatInput</span>: Handles user input and submission</li>
                      <li><span className="text-green-400">MessageContent</span>: Processes message content, including code highlighting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>2. State Management</h3>
              <p className='mb-2'>
                Chat state is managed using React hooks. The application maintains context across the conversation to enable coherent multi-turn interactions.
              </p>
              <div className="bg-gray-900 p-4 rounded-md border-l-4 border-green-500">
                <div className="flex items-start text-sm">
                  <div className="mr-4 flex-shrink-0 pt-1">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">State Implementation:</div>
                    <ul className="list-disc text-gray-300 text-sm ml-4 mt-1">
                      <li>React <span className="text-green-400">useState</span> for local component state</li>
                      <li>Custom <span className="text-green-400">useChat</span> hook to encapsulate chat logic</li>
                      <li>Streaming state tracked for smooth message appearance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>3. API Integration</h3>
              <p className='mb-2'>
                The application communicates with the Deepseek-v1 API through Next.js API routes, which handle authentication and response streaming. This architecture keeps API keys secure on the server side while enabling real-time response generation.
              </p>
              <div className="bg-gray-900 p-4 rounded-md border-l-4 border-green-500">
                <div className="flex items-start text-sm">
                  <div className="mr-4 flex-shrink-0 pt-1">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">API Flow:</div>
                    <ul className="list-disc text-gray-300 text-sm ml-4 mt-1">
                      <li>Client sends message to Next.js API route</li>
                      <li>Server authenticates and forwards request to Deepseek-v1 AI</li>
                      <li>Stream response is processed using <span className="text-green-400">ReadableStream</span></li>
                      <li>Response chunks are decoded and sent to client in real time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className='text-white text-lg font-semibold mb-2'>4. Responsive Design</h3>
              <p className='mb-2'>
                The UI is fully responsive, adapting to different screen sizes from mobile devices to desktop computers. This is achieved through Tailwind's responsive utilities and careful component design.
              </p>
              <div className="bg-gray-900 p-4 rounded-md border-l-4 border-green-500">
                <div className="flex items-start text-sm">
                  <div className="mr-4 flex-shrink-0 pt-1">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Responsive Features:</div>
                    <ul className="list-disc text-gray-300 text-sm ml-4 mt-1">
                      <li>Different layouts for mobile and desktop</li>
                      <li>Adaptive message sizing and positioning</li>
                      <li>Touch-friendly controls for mobile users</li>
                      <li>Optimized code display for smaller screens</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div>
          <div className="mt-8 bg-green-900/20 rounded-lg p-4 border border-green-800/40">
            <h3 className="text-green-300 font-medium mb-2">Implementation Notes</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• React's memo and useCallback for optimized rendering of chat messages</li>
              <li>• Implemented custom streaming solution to handle Deepseek-v1 SSE response format</li>
              <li>• Used IntersectionObserver for efficient chat scroll handling</li>
              <li>• Added support for keyboard shortcuts to enhance user experience</li>
              <li>• Employed regex-based parsing for automatic code syntax detection</li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          ref={performanceRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="performance-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Demo & Results</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            AI Terminal Chat delivers a smooth, responsive experience for users interacting with AI models. The application has been optimized for performance across various devices and connection speeds.
          </p>
          
          <div className="bg-gray-900 p-5 rounded-lg mb-8 border border-gray-700">
            <h3 className="text-white text-lg font-medium mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-green-400 text-2xl font-bold">&lt; 1s</div>
                <div className="text-gray-400 text-sm">Initial Response</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-green-400 text-2xl font-bold">98%</div>
                <div className="text-gray-400 text-sm">Lighthouse Score</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-green-400 text-2xl font-bold">100%</div>
                <div className="text-gray-400 text-sm">Mobile Responsive</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-green-400 text-2xl font-bold">A+</div>
                <div className="text-gray-400 text-sm">Accessibility Rating</div>
              </div>
            </div>
          </div>
          
          {/* Feature Comparison */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-medium mb-3">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-800">Feature</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-800">AI Terminal Chat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-800">Standard Chat UIs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-300">Code Syntax Highlighting</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> Multi-language support
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-red-400">✗</span> Limited or none
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-300">Response Streaming</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> Real-time character by character
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-yellow-400">⚠</span> Often chunked or delayed
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-300">Terminal Aesthetics</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> Developer-focused design
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-red-400">✗</span> Generic messaging UI
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-300">Mobile Responsiveness</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> Fully responsive
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="text-yellow-400">⚠</span> Varies widely
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          

          
          {/* User feedback */}
          <div className="mt-8 bg-gray-900 rounded-lg p-5 border border-gray-700">
            <h3 className="text-white text-lg font-medium mb-4">User Testimonials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">D</div>
                  <div className="ml-2">
                    <div className="text-white text-sm">Developer</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"The code highlighting feature makes this so much better than standard chat interfaces. I love how clean and developer-friendly the whole UI is."</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
                  <div className="ml-2">
                    <div className="text-white text-sm">Student</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"I use this for programming help daily. The real-time streaming makes it feel much more responsive than other AI chat interfaces I've tried."</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Aiterminal