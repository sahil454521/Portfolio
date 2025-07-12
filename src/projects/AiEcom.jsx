import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import projectImage from '../assets/p2.png'

const AiEcom = () => {
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
                alt="AI-Ecommerce Screenshot" 
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
              🛒 AI-Powered E-Commerce Platform
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-300 mb-6 text-lg"
            >
              A modern e-commerce platform leveraging artificial intelligence for enhancing online shopping experiences, with a focus on price prediction algorithms and an innovative bartering system.
            </motion.p>

            {/* Live Demo Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-3">🚀 Project Status</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <span
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg"
                >
                  <span>In Development</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                <a 
                  href="https://github.com/sahil454521/ai-ecommerce" 
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
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">JavaScript</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">React.js</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">TailwindCSS</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">TensorFlow.js</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">Python</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">Flask</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Machine Learning</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">SQLite</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Amazon S3</span>
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
              <li>AI-powered price prediction for products based on market trends and attributes</li>
              <li>Smart bartering system for user-to-user exchanges with fair value estimation</li>
              <li>Personalized user experience based on browsing patterns and preferences</li>
              <li>Dynamic pricing optimization using real-time market data analysis</li>
              <li>Automated inventory management with predictive restocking capabilities</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🎯 Current Implementation</h2>
              <p className="text-gray-300 mb-3">Active development of key AI systems:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Price Prediction Model (65% complete)</li>
                <li>Bartering Algorithm (40% complete)</li>
                <li>Frontend User Interface (75% complete)</li>
                <li>Backend API Services (60% complete)</li>
              </ul>
              <p className="text-yellow-400 mt-4">⚠️ This is a learning project focused on implementing AI solutions in e-commerce.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🔮 Coming Soon</h2>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>ChatBot customer support with sentiment analysis</li>
                <li>Visual search capabilities for product discovery</li>
                <li>A/B testing framework for UI optimization</li>
                <li>Enhanced AI models with reinforcement learning</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-900 p-5 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">🎓 Learning Journey</h2>
            <p className="text-gray-300 mb-4">
              This project represents my first major foray into implementing custom AI solutions. It's a continuous learning experience where I'm exploring:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-blue-400 font-medium mb-3">AI Model Training</h3>
                <p className="text-gray-300 text-sm">
                  Learning how to collect, clean and prepare data for training machine learning models for price prediction, with a focus on handling limited datasets across diverse product categories.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-blue-400 font-medium mb-3">API Development</h3>
                <p className="text-gray-300 text-sm">
                  Building RESTful APIs to serve model predictions and handle bartering logic between users, creating efficient endpoints that can handle real-time prediction requests with minimal latency.
                </p>
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

export default AiEcom