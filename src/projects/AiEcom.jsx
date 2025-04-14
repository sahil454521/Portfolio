import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const AiEcom = () => {
  // State for tracking scroll position for navigation
  const [activeSection, setActiveSection] = useState('overview');
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Refs for each section
  const overviewRef = useRef(null);
  const featuresRef = useRef(null);
  const technologiesRef = useRef(null);
  const architectureRef = useRef(null);
  const demoRef = useRef(null);
  const learningsRef = useRef(null);

  // Observer for tracking scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = [
        { ref: overviewRef, id: 'overview' },
        { ref: featuresRef, id: 'features' },
        { ref: technologiesRef, id: 'technologies' },
        { ref: architectureRef, id: 'architecture' },
        { ref: demoRef, id: 'demo' },
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
    "AI-powered price prediction for products",
    "Smart bartering system for user-to-user exchanges",
    "Personalized user experience based on browsing patterns",
    "Dynamic pricing optimization using market data",
    "Automated inventory management with predictive restocking",
    "ChatBot customer support with sentiment analysis",
    "Visual search capabilities for product discovery",
    "A/B testing framework for UI optimization"
  ]

  const technologies = [
    "JavaScript",
    "React.js",
    "TailwindCSS",
    "TensorFlow.js",
    "Python",
    "Flask",
    "Machine Learning",
    "SQLite",
    "Amazon S3",
    "Docker"
  ]
  
  const aiModels = [
    {
      name: "Price Prediction Model",
      description: "Predicts optimal product pricing based on market trends, product attributes, and historical sales data.",
      status: "In Development",
      implementation: "Regression model using historical price data and product features to estimate fair market value.",
      technologies: ["TensorFlow.js", "Python", "Pandas", "Scikit-learn"]
    },
    {
      name: "Bartering Algorithm",
      description: "Evaluates fair exchange value between different products for user-to-user trading.",
      status: "Initial Testing",
      implementation: "Hybrid recommendation system with value estimation based on product categories and market data.",
      technologies: ["Python", "Flask API", "MongoDB"]
    }
  ]
  
  const learningHighlights = [
    {
      area: "AI Model Training",
      description: "Learning how to collect, clean and prepare data for training machine learning models for price prediction.",
      challenge: "Handling limited datasets and ensuring predictions remain accurate across diverse product categories."
    },
    {
      area: "API Development",
      description: "Building RESTful APIs to serve model predictions and handle bartering logic between users.",
      challenge: "Creating efficient endpoints that can handle real-time prediction requests with minimal latency."
    },
    {
      area: "Frontend Integration",
      description: "Integrating AI functionality seamlessly into the user experience through intuitive interfaces.",
      challenge: "Explaining AI recommendations to users in a transparent and understandable way."
    },
    {
      area: "System Architecture",
      description: "Designing a scalable system that balances between client-side and server-side AI processing.",
      challenge: "Optimizing model size and inference time for client-side deployment vs. API calls."
    }
  ]
  
  const navigationItems = [
    { id: 'overview', label: 'Project Overview' },
    { id: 'features', label: 'Key Features' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'demo', label: 'Current Progress' },
    { id: 'learnings', label: 'Learning Journey' }
  ];

  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16 relative'>
      {/* Side Navigation */}
      <div className='hidden lg:block fixed top-1/3 left-8 transform -translate-y-1/2 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl z-10'>
        <div className="mb-4">
          <h3 className="text-white text-lg font-medium mb-3">Project Navigation</h3>
          <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 h-0.5 rounded-full"></div>
        </div>
        
        <div className="relative">
          <div className="absolute left-[12px] top-0 w-0.5 h-full bg-gray-700"></div>
          
          <motion.div 
            className="absolute left-[12px] top-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500" 
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
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
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
          className='text-white text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500'
        >
          AI-Powered E-Commerce Platform
        </motion.h1>
        
        {/* Project Status Badge */}
        <div className="mb-8 flex justify-center">
          <div className="px-4 py-1.5 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-medium inline-flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
            In Development • Learning Project
          </div>
        </div>
        
        {/* Overview Section */}
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
            This AI-Powered E-Commerce Platform represents my first venture into implementing custom AI solutions. 
            Started as a learning project, it aims to leverage artificial intelligence for enhancing online shopping experiences, 
            with a special focus on price prediction algorithms and an innovative bartering system.
          </p>
          <p className='text-gray-300 leading-relaxed mb-4'>
            The platform explores how machine learning can transform traditional e-commerce by enabling more 
            intelligent pricing strategies and facilitating user-to-user exchanges. While still in active development,
            this project demonstrates my journey in applying AI concepts to solve real-world commerce problems.
          </p>
          
          {/* Project Vision Visualization */}
          <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-800 p-3">
              <h3 className="text-white font-medium text-center">Project Vision</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 border-r border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-white mb-3">AI Price Prediction</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Implementing machine learning models that analyze market trends, product features, and historical data to 
                  suggest optimal pricing strategies for sellers.
                </p>
                <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Implementation Focus:</div>
                  <div className="text-sm text-white">Regression models & time series forecasting</div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="h-12 w-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-white mb-3">Smart Bartering System</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Creating an AI-powered bartering mechanism that evaluates fair exchange value between different products,
                  enabling users to trade items directly.
                </p>
                <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Implementation Focus:</div>
                  <div className="text-sm text-white">Value estimation & recommendation algorithms</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
            <div className="mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Learning Focus:</h3>
              <p className="text-gray-300 text-sm">
                This project represents my first journey into custom AI development, focusing on practical applications
                in e-commerce. It's a continuous learning experience where I'm exploring model training, API integration,
                and creating user-friendly AI interfaces.
              </p>
            </div>
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
                <span className='text-blue-400 mr-3 text-xl'>→</span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <div className="mt-8 space-y-6">
            {/* Feature Focus: AI Price Prediction */}
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-medium">AI Price Prediction</h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                The AI pricing system analyzes multiple factors to recommend optimal prices for sellers, 
                including market trends, product attributes, seasonal patterns, and competitive pricing.
              </p>
              
              <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-4">
                <h4 className="text-blue-400 font-medium mb-2">How It Works</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                  <li>Data collection from multiple market sources</li>
                  <li>Feature engineering of product attributes</li>
                  <li>Training regression models on historical price data</li>
                  <li>Parameter tuning for accuracy optimization</li>
                  <li>Real-time price suggestions with confidence intervals</li>
                </ol>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 text-sm font-medium mb-2">Implementation Status</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-xs text-gray-400">65%</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 text-sm font-medium mb-2">Current Challenge</h4>
                  <p className="text-xs text-gray-300">
                    Improving prediction accuracy for new products with limited historical data
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature Focus: Bartering System */}
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-medium">Smart Bartering System</h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                The bartering system enables direct product exchanges between users by intelligently estimating 
                fair trade values and suggesting potentially compatible exchange partners.
              </p>
              
              <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-4">
                <h4 className="text-indigo-400 font-medium mb-2">How It Works</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                  <li>Product value estimation based on multiple attributes</li>
                  <li>User preference analysis to find compatible trade partners</li>
                  <li>Suggestion of fair trades with adjustable parameters</li>
                  <li>Negotiation system with AI-powered recommendations</li>
                  <li>Trust scoring to ensure reliable exchanges</li>
                </ol>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-indigo-400 text-sm font-medium mb-2">Implementation Status</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: '40%'}}></div>
                    </div>
                    <span className="text-xs text-gray-400">40%</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-indigo-400 text-sm font-medium mb-2">Current Challenge</h4>
                  <p className="text-xs text-gray-300">
                    Creating a fair value estimation system across diverse product categories
                  </p>
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
          <div className='flex flex-wrap gap-3 mb-6'>
            {technologies.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md'
              >
                {tech}
              </motion.span>
            ))}
          </div>
          
          <div className='text-gray-300 leading-relaxed'>
            <p className='mb-4'>
              The AI E-commerce Platform uses React.js for the frontend UI components, with TailwindCSS for styling.
              The backend is built with Python and Flask, providing RESTful API services to the frontend. The AI models
              are primarily developed using TensorFlow.js for client-side processing and Python-based ML libraries for 
              server-side predictions.
            </p>
            
            <div className="mt-6 bg-gray-900 rounded-lg p-5 border border-gray-700">
              <h3 className="text-white text-lg font-medium mb-4">AI Stack Details</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 7H7v6h6V7z" />
                        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium">TensorFlow.js</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Used for client-side inference, allowing for real-time price predictions without server round-trips.
                    The models are trained server-side and exported to TensorFlow.js format for browser execution.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium">Python ML Stack</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Server-side ML processing using scikit-learn for data preprocessing, TensorFlow for model training, 
                    and Flask for serving predictions through RESTful APIs.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-medium">Data Pipeline</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Custom ETL (Extract, Transform, Load) processes for collecting product data, cleaning it, and 
                    preparing it for model training and evaluation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Architecture Section */}
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
            The platform follows a modern architecture that separates concerns between UI, business logic, 
            and data processing layers. The AI components are designed to be both performant and privacy-conscious.
          </p>
          
          <div className='space-y-6 text-gray-300'>
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-3">System Architecture</h3>
              
              <div className="w-full flex flex-col space-y-4">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 text-sm font-medium mb-2 text-center">Client Layer</h4>
                  <div className="flex justify-center space-x-2">
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">React UI</div>
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">TensorFlow.js Models</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-0.5 h-5 bg-blue-500"></div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 text-sm font-medium mb-2 text-center">API Layer</h4>
                  <div className="flex justify-center">
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">Flask REST Endpoints</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-0.5 h-5 bg-blue-500"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <h4 className="text-blue-400 text-xs font-medium mb-2 text-center">Python ML Services</h4>
                    <div className="space-y-1">
                      <div className="bg-gray-900 p-1 rounded text-xs text-center text-white">Price Prediction</div>
                      <div className="bg-gray-900 p-1 rounded text-xs text-center text-white">Bartering Algorithm</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <h4 className="text-blue-400 text-xs font-medium mb-2 text-center">Business Logic</h4>
                    <div className="space-y-1">
                      <div className="bg-gray-900 p-1 rounded text-xs text-center text-white">User Management</div>
                      <div className="bg-gray-900 p-1 rounded text-xs text-center text-white">Product Catalog</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-0.5 h-5 bg-blue-500"></div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 text-sm font-medium mb-2 text-center">Data Layer</h4>
                  <div className="flex justify-center space-x-2">
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">SQLite DB</div>
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">ML Models</div>
                    <div className="bg-gray-900 px-3 py-1 rounded text-xs text-center text-white">S3 Storage</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-3">AI Models Implementation</h3>
              
              <div className="space-y-4">
                {aiModels.map((model, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">{model.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        model.status === "In Development" ? "bg-amber-500/20 text-amber-400" :
                        model.status === "Initial Testing" ? "bg-blue-500/20 text-blue-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {model.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{model.description}</p>
                    
                    <div className="text-xs text-gray-400 mb-1">Implementation:</div>
                    <p className="text-gray-300 text-sm mb-3">{model.implementation}</p>
                    
                    <div className="text-xs text-gray-400 mb-1">Technologies:</div>
                    <div className="flex flex-wrap gap-2">
                      {model.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="text-xs bg-gray-700 text-blue-300 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          ref={demoRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="demo-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Current Progress</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            The AI E-commerce Platform is currently in active development. Below is a demonstration 
            of the current implementation and ongoing work.
          </p>
          
          {/* Project Progress */}
          <div className="bg-gray-900 p-5 rounded-lg mb-8">
            <h3 className="text-white text-lg font-medium mb-4">Project Progress</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Frontend Development</span>
                  <span className="text-gray-400">75%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Backend API</span>
                  <span className="text-gray-400">60%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Price Prediction AI</span>
                  <span className="text-gray-400">65%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Bartering System</span>
                  <span className="text-gray-400">40%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '40%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Testing & Optimization</span>
                  <span className="text-gray-400">30%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Demo Video */}
          <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-gray-400 text-sm">Project Demo</span>
              </div>
            </div>
            <div className="aspect-video relative bg-black">
              <iframe 
                src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7279894417535045633" 
                className="w-full h-full"
                frameBorder="0" 
                allowFullScreen=""
                title="AI Ecommerce Platform Demo" 
              ></iframe>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a 
              href="https://www.linkedin.com/feed/update/urn:li:activity:7279894417535045633/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center"
            >
              <span>Watch Full Demo on LinkedIn</span>
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <div className="mt-8 bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
            <h3 className="text-white font-medium mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              Development Note
            </h3>
            <p className="text-gray-300 text-sm">
              This project is a work-in-progress learning experience where I'm continuously implementing and 
              refining AI features. The current demo showcases early implementations of the price prediction 
              and bartering functionalities.
            </p>
          </div>
        </motion.div>

        {/* Learnings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          ref={learningsRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-gray-800'
          id="learnings-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Learning Journey</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            This project represents my first major foray into implementing custom AI solutions. Here are the key learnings 
            and challenges I've encountered along the way.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {learningHighlights.map((item, index) => (
              <div key={index} className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <h3 className="text-blue-400 font-medium mb-3">{item.area}</h3>
                <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Challenge:</div>
                  <p className="text-sm text-white">{item.challenge}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-white text-lg font-medium mb-3">Key Takeaways</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Data quality is paramount:</strong>{" "}
                  The predictive models are only as good as the data they're trained on. Cleaning and preprocessing data 
                  is just as important as the model architecture.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Client vs. server processing:</strong>{" "}
                  Finding the right balance between client-side ML inference for speed and server-side processing for 
                  more complex models has been crucial.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">User experience with AI:</strong>{" "}
                  Making AI recommendations transparent and explainable to users improves trust and adoption.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Iterative development:</strong>{" "}
                  Starting with simpler models and continuously improving them based on evaluation metrics has proven 
                  more effective than attempting complex solutions from the start.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
            <h3 className="text-white text-lg font-medium mb-3">Future Development Plans</h3>
            <div className="space-y-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Short-term Goals</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Complete initial price prediction model with at least 70% accuracy
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Implement basic bartering system value estimation
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Develop user interface for listing products for sale or barter
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <h4 className="text-blue-400 text-sm font-medium mb-2">Long-term Vision</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Enhance AI models with reinforcement learning for continuous improvement
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Add computer vision capabilities for product recognition and categorization
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">•</span>
                    Develop a mobile app version with offline capabilities
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://github.com/sahil454521/ai-ecommerce"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Follow project progress on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AiEcom