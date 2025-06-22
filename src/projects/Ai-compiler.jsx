import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import projectImage from '../assets/ai-compiler.png'

const AiCompiler = () => {
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
                alt="AiCompiler Screenshot" 
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
              🧠 AiCompiler — Your AI-Powered Code Suggestion IDE
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-gray-300 mb-6 text-lg"
            >
              An intelligent, VS Code-style online code editor that suggests machine learning code snippets in real-time using a custom-trained ML model.
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
                  href="https://ai-compiler-eta.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <span>Frontend</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a 
                  href="https://ml-code-suggestion-api.onrender.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <span>ML API (FastAPI)</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">React (Next.js)</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">Monaco Editor</span>
                <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-md text-sm">Framer Motion</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">Node.js</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">FastAPI</span>
                <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-md text-sm">scikit-learn</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Clerk Auth</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Convex DB</span>
                <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-md text-sm">Vercel/Render</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Dashboard Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-10 mb-8 bg-gray-900 rounded-xl overflow-hidden border border-gray-800"
        >
          <div className="bg-gray-800 p-3 flex items-center gap-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm">AiCompiler — VS Code-inspired IDE</span>
          </div>
          <div className="grid md:grid-cols-5 h-[300px]">
            {/* Left Sidebar */}
            <div className="hidden md:block bg-gray-950 border-r border-gray-800 p-2">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* File Explorer */}
            <div className="hidden md:block bg-gray-900 border-r border-gray-800 p-2">
              <div className="text-gray-400 text-xs p-2 mb-2 font-medium">EXPLORER</div>
              <div className="text-gray-300 text-xs mb-1 pl-2 flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                ML_PROJECT
              </div>
              <div className="pl-4 text-xs">
                <div className="text-blue-400 flex items-center mb-1">
                  <svg className="w-3 h-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  model.py
                </div>
                <div className="text-gray-400 flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  train.py
                </div>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="md:col-span-3 bg-gray-950 p-3 font-mono text-xs md:text-sm overflow-hidden overflow-y-auto">
              <div className="flex text-gray-500 mb-2 text-xs">
                <span className="mr-4">model.py</span>
                <span>train.py</span>
              </div>
              <div className="leading-relaxed">
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">1</span>
                  <span className="text-blue-400">import</span>
                  <span className="text-gray-200 ml-1">numpy as np</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">2</span>
                  <span className="text-blue-400">import</span>
                  <span className="text-gray-200 ml-1">pandas as pd</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">3</span>
                  <span className="text-blue-400">from</span>
                  <span className="text-gray-200 ml-1">sklearn.model_selection</span>
                  <span className="text-blue-400 ml-1">import</span>
                  <span className="text-gray-200 ml-1">train_test_split</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">4</span>
                  <span className="text-blue-400">from</span>
                  <span className="text-gray-200 ml-1">sklearn.linear_model</span>
                  <span className="text-blue-400 ml-1">import</span>
                  <span className="text-gray-200 ml-1">LinearRegression</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">5</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">6</span>
                  <span className="text-gray-200">df = pd.read_csv(</span>
                  <span className="text-green-400">'data.csv'</span>
                  <span className="text-gray-200">)</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">7</span>
                  <span className="text-gray-200">X = df.drop(</span>
                  <span className="text-green-400">'target'</span>
                  <span className="text-gray-200">, axis=1)</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">8</span>
                  <span className="text-gray-200">y = df[</span>
                  <span className="text-green-400">'target'</span>
                  <span className="text-gray-200">]</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">9</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">10</span>
                  <span className="text-gray-200">X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">11</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">12</span>
                  <span className="text-gray-200">model = LinearRegression()</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-7 text-right pr-2">13</span>
                  <span className="text-gray-200">model</span>
                  <span className="text-purple-400">.fit</span>
                  <span className="text-gray-200">(X_train, y_train)</span>
                  <span className="text-gray-500 ml-4"># Ghost text suggestion: .fit(X_train, y_train)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
              <li>Live Monaco editor with syntax highlighting</li>
              <li>Real-time code analysis via a FastAPI ML model</li>
              <li>Predicts the most likely ML framework/library (e.g. <code className="text-blue-400">LinearRegression</code>, <code className="text-blue-400">XGBoost</code>)</li>
              <li>Returns a relevant code snippet (e.g. <code className="text-blue-400">.fit(X, y)</code>) as <strong>inline ghost text</strong></li>
              <li>Supports <code className="text-blue-400">Tab</code> to auto-insert suggestions like VS Code</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🎯 Current Capabilities</h2>
              <p className="text-gray-300 mb-3">Suggests ML code in Python for:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Scikit-learn (Linear Regression, Random Forest, etc.)</li>
                <li>TensorFlow / Keras</li>
                <li>PyTorch</li>
                <li>XGBoost</li>
              </ul>
              <p className="text-yellow-400 mt-4">⚠️ Currently limited to single-line code suggestions for Python ML use cases.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">🔮 Coming Soon</h2>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Multi-line completions with full context</li>
                <li>Support for JavaScript, C++, TypeScript, etc.</li>
                <li>Auto <code className="text-blue-400">pip install</code> prompts</li>
                <li>Fine-tuned code suggestion based on user style</li>
              </ul>
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

// Add this to your global CSS file (index.css or App.css)
// Or add it inline using styled-components or emotion if you prefer
const cssToAdd = `
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 rgba(31, 41, 55, 0.5);
}
`;

export default AiCompiler