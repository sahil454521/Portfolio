import React,{useEffect} from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import projectImage from '../assets/ai-terminal.png'

const Aiterminal = () => {
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 overflow-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 bg-opacity-70 rounded-xl p-8 shadow-lg border border-gray-800"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="aspect-video overflow-hidden rounded-xl">
              <img 
                src={projectImage} 
                alt="AI Terminal Screenshot" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Project Description */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8 }}
              className="h-[1px] bg-gradient-to-r from-blue-500 to-purple-500 mb-4"
            />
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              💬 AI Terminal — Terminal-Inspired Chat Interface
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-300 mb-6 text-lg"
            >
              A modern conversational interface that combines the aesthetics of a developer terminal with the power of advanced language models, supporting code syntax highlighting and real-time responses.
            </motion.p>

            {/* Live Demo Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-3">🚀 Live Demo</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <a 
                  href="https://ai-chat-bot-gcar.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <span>Live Demo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a 
                  href="https://github.com/sahil454521/ai-chat-bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <span>GitHub Repository</span>
                  <svg className="h-5 w-5 ml-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8 overflow-y-auto max-h-[150px] custom-scrollbar pr-2"
            >
              <h2 className="text-xl font-semibold text-white mb-3">🛠 Tech Stack</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">React</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">Next.js</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">Tailwind CSS</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">Deepseek v1 API</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">Server-Side Rendering</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Framer Motion</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">React-Syntax-Highlighter</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Vercel</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Key Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 overflow-y-auto max-h-[400px] custom-scrollbar pr-2"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🧠 What It Does</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-2">
              <li>Natural language conversations with advanced AI models</li>
              <li>Support for different conversation styles and AI personalities</li>
              <li>Message history and conversation context preservation</li>
              <li>Code snippet highlighting with automatic syntax detection</li>
              <li>Mobile-responsive design for on-the-go use</li>
              <li>Dark mode with sleek interface inspired by modern terminal aesthetics</li>
              <li>Message streaming for real-time response generation</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🎯 Key Implementation Details</h2>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>React's memo and useCallback for optimized rendering of chat messages</li>
                <li>Custom streaming solution to handle Deepseek-v1 SSE response format</li>
                <li>IntersectionObserver for efficient chat scroll handling</li>
                <li>Keyboard shortcuts to enhance user experience</li>
                <li>Regex-based parsing for automatic code syntax detection</li>
              </ul>
              <p className="text-yellow-400 mt-4">⚠️ For optimal experience, use modern browsers with SSE support.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🔮 Project Architecture</h2>
              <div className="space-y-3">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h3 className="text-blue-400 font-medium mb-1">1. Frontend Components</h3>
                  <p className="text-gray-300 text-sm">Clean component hierarchy with ChatContainer, ChatMessage, and MessageContent components for organized rendering.</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h3 className="text-blue-400 font-medium mb-1">2. State Management</h3>
                  <p className="text-gray-300 text-sm">React hooks for efficient state management, with custom useChat hook to encapsulate conversation logic.</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h3 className="text-blue-400 font-medium mb-1">3. API Integration</h3>
                  <p className="text-gray-300 text-sm">Next.js API routes handle authentication and response streaming, keeping API keys secure on the server side.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-900 p-5 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">✨ UI Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-blue-400 font-medium mb-3">Terminal-Inspired UI</h3>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center mb-2 px-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-gray-400 text-xs">AI Terminal Chat</p>
                    </div>
                  </div>
                  <div className="text-gray-300 text-xs font-mono">
                    <p className="text-gray-400">$ Initializing AI Terminal...</p>
                    <p className="text-gray-400">$ System ready.</p>
                    <div className="bg-gray-800 my-2 p-2 rounded">
                      <p>Welcome to AI Terminal. How can I assist you today?</p>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-gray-500">$</span>
                      <div className="h-4 w-1 bg-gray-300 ml-2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-blue-400 font-medium mb-3">Code Syntax Highlighting</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-xs text-gray-400 px-3 py-1 flex justify-between">
                    <span>python</span>
                    <span>example</span>
                  </div>
                  <div className="p-3 text-xs">
                    <pre className="text-green-300 font-mono">
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
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <Link 
            to="/" 
            className="inline-flex items-center px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Aiterminal