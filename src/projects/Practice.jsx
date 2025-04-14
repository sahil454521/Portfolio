import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Practice = () => {
  // State for tracking scroll position for navigation
  const [activeSection, setActiveSection] = useState('overview');
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Refs for each section
  const overviewRef = useRef(null);
  const featuresRef = useRef(null);
  const technologiesRef = useRef(null);
  const projectsRef = useRef(null);
  const learningsRef = useRef(null);

  // Observer for tracking scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = [
        { ref: overviewRef, id: 'overview' },
        { ref: featuresRef, id: 'features' },
        { ref: technologiesRef, id: 'technologies' },
        { ref: projectsRef, id: 'projects' },
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
    "Daily coding practice exercises with increasing complexity",
    "Hands-on implementations of various programming concepts",
    "Diverse mini-projects showcasing different technologies",
    "Interactive coding challenges for skill development",
    "Version-controlled progress tracking through Git",
    "Cross-platform application experiments and prototypes",
    "Algorithm implementation and optimization exercises",
    "UI/UX design patterns and component implementations"
  ];

  const technologies = [
    "JavaScript",
    "HTML/CSS",
    "React",
    "Node.js",
    "Python",
    "Git",
    "RESTful APIs",
    "Data Structures & Algorithms",
    "DOM Manipulation",
    "Responsive Design"
  ];

  const practiceProjects = [
    {
      name: "Todo Application",
      description: "A feature-rich todo application with local storage persistence, categorization, and filtering capabilities.",
      technologies: ["JavaScript", "HTML", "CSS", "LocalStorage API"]
    },
    {
      name: "Weather Dashboard",
      description: "Real-time weather information dashboard that fetches and displays data from a weather API with location search.",
      technologies: ["JavaScript", "API Integration", "CSS", "Async/Await"]
    },
    {
      name: "Calculator App",
      description: "A fully functional calculator with standard and scientific operations, history tracking, and keyboard support.",
      technologies: ["JavaScript", "HTML", "CSS", "Math Operations"]
    },
    {
      name: "Form Validation",
      description: "Client-side form validation implementation with real-time feedback and multiple validation patterns.",
      technologies: ["JavaScript", "RegEx", "DOM Manipulation"]
    },
    {
      name: "Accordion Component",
      description: "Reusable accordion component with customizable styling, animations, and nested content support.",
      technologies: ["JavaScript", "CSS Transitions", "HTML"]
    }
  ];

  const learningHighlights = [
    {
      area: "JavaScript Fundamentals",
      description: "Strengthening core JavaScript concepts through daily coding challenges and practical implementation.",
      challenge: "Understanding asynchronous programming patterns and callback management."
    },
    {
      area: "DOM Manipulation",
      description: "Creating dynamic web interfaces by manipulating the Document Object Model efficiently.",
      challenge: "Optimizing performance when working with large DOM trees and frequent updates."
    },
    {
      area: "Responsive Design",
      description: "Building layouts that adapt seamlessly to different screen sizes and devices.",
      challenge: "Balancing functionality with aesthetic appeal across various viewport dimensions."
    },
    {
      area: "API Integration",
      description: "Connecting to external APIs to fetch and utilize data in web applications.",
      challenge: "Handling error states and implementing robust fallback mechanisms when APIs fail."
    }
  ];

  const codeSnippets = [
    {
      title: "Event Delegation Implementation",
      language: "javascript",
      code: `// Event delegation for dynamic list items
document.querySelector('.todo-list').addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    const todoItem = e.target.closest('.todo-item');
    const todoId = todoItem.dataset.id;
    
    // Remove from UI
    todoItem.remove();
    
    // Remove from storage
    removeTodoFromStorage(todoId);
  } else if (e.target.matches('.complete-btn')) {
    const todoItem = e.target.closest('.todo-item');
    todoItem.classList.toggle('completed');
    
    // Update status in storage
    toggleTodoStatus(todoItem.dataset.id);
  }
});`
    },
    {
      title: "Fetch API with Error Handling",
      language: "javascript",
      code: `async function getWeatherData(city) {
  try {
    const response = await fetch(
      \`https://api.weatherapi.com/v1/current.json?key=\${API_KEY}&q=\${city}\`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    
    const data = await response.json();
    displayWeatherInfo(data);
    saveToSearchHistory(city);
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    showErrorMessage(error.message);
  } finally {
    hideLoadingSpinner();
  }
}`
    }
  ];
  
  const navigationItems = [
    { id: 'overview', label: 'Project Overview' },
    { id: 'features', label: 'Key Features' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'projects', label: 'Practice Projects' },
    { id: 'learnings', label: 'Learnings' }
  ];

  // Find the index of active section for progress calculation
  const activeIndex = navigationItems.findIndex(item => item.id === activeSection);
  // Make sure progress shows complete when at learnings section
  const calculatedProgressPercentage = activeSection === 'learnings' ? 100 : (activeIndex / (navigationItems.length - 1)) * 100;

  // Project links
  const githubUrl = "https://github.com/sahil454521/Practice_Projects";
  
  return (
    <div className='bg-[#111111] min-h-screen px-4 py-16 relative'>
      {/* Sidebar Navigation - Changed to green/teal theme */}
      <div className='hidden lg:block fixed top-1/3 left-8 transform -translate-y-1/2 bg-[#1a1a1a] p-6 rounded-xl border border-[#1f3a32] shadow-xl z-10'>
        <div className="mb-4">
          <h3 className="text-white text-lg font-medium mb-3">Project Navigation</h3>
          <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 h-0.5 rounded-full"></div>
        </div>
        
        <div className="relative">
          {/* Vertical progress line */}
          <div className="absolute left-[12px] top-0 w-0.5 h-full bg-gray-700"></div>
          
          {/* Filled progress line based on active section */}
          <motion.div 
            className="absolute left-[12px] top-0 w-0.5 bg-gradient-to-b from-emerald-500 to-teal-500" 
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
                    isActive ? 'text-emerald-400 font-medium' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => {
                    document.getElementById(`${item.id}-section`).scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  <motion.div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center ${
                      isPast ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-800 border-2 border-gray-700'
                    }`}
                    initial={{ scale: 1 }}
                    animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isPast && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: isActive ? Infinity : 0,
                          repeatDelay: 0.5
                        }}
                        className="absolute w-full h-full rounded-full bg-emerald-500 opacity-50"
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
          className='text-white text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500'
        >
          Practice Projects
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          ref={overviewRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-[#1f3a32]'
          id="overview-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Project Overview</h2>
          <p className='text-gray-300 leading-relaxed mb-4'>
            Practice Projects is my personal coding playground where I implement small, focused applications to strengthen my programming skills and experiment with various technologies. This repository serves as a living documentation of my learning journey, featuring a collection of mini-projects that tackle specific concepts and challenges.
          </p>
          <p className='text-gray-300 leading-relaxed mb-4'>
            Each project is designed to explore different aspects of web development, from fundamental JavaScript concepts to UI components, API integrations, and algorithmic problem-solving. By maintaining this repository with regular commits, I track my progress and create a portfolio of practical implementations that demonstrate my evolving capabilities as a developer.
          </p>
          
          {/* Project Highlights */}
          <div className="mt-6 border border-[#1f3a32] rounded-lg overflow-hidden">
            <div className="bg-[#1f3a32] p-3">
              <h3 className="text-white font-medium text-center">Learning Approach</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 border-r border-[#1f3a32] bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                  </svg>
                </div>
                <h4 className="text-white text-lg font-medium mb-2">Learn by Doing</h4>
                <p className="text-gray-300 text-sm">
                  Hands-on implementation of concepts immediately after learning them, reinforcing understanding through practical application rather than theoretical knowledge alone.
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="h-12 w-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h4 className="text-white text-lg font-medium mb-2">Consistent Practice</h4>
                <p className="text-gray-300 text-sm">
                  Regular coding sessions with incremental challenges that build upon previous knowledge, creating a structured learning path with visible progression over time.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center mt-8">
            <div className="px-4 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium inline-flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
              </svg>
              Learning Repository • Skill Development
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          ref={featuresRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-[#1f3a32]'
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
                <span className='text-emerald-400 mr-3 text-xl'>→</span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          {/* Feature Demonstration */}
          <div className="mt-8 bg-[#0c1f1a] p-6 rounded-lg border border-[#1f3a32] overflow-hidden">
            <div className="flex flex-col space-y-6">
              {/* Sample Project UI Preview */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Project Structure & Organization
                </h3>
                <div className="bg-[#152822] rounded-lg p-4 border border-[#1f3a32]">
                  <div className="flex items-center mb-3 px-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-gray-400 text-xs">Practice Projects Directory Structure</p>
                    </div>
                  </div>
                  <div className="bg-black rounded p-3 font-mono text-sm text-gray-300">
                    <p className="text-teal-400">Practice_Projects/</p>
                    <p className="text-gray-400 pl-4">├── <span className="text-emerald-400">ToDo-App/</span></p>
                    <p className="text-gray-400 pl-8">├── index.html</p>
                    <p className="text-gray-400 pl-8">├── styles.css</p>
                    <p className="text-gray-400 pl-8">└── app.js</p>
                    <p className="text-gray-400 pl-4">├── <span className="text-emerald-400">Weather-Dashboard/</span></p>
                    <p className="text-gray-400 pl-8">├── index.html</p>
                    <p className="text-gray-400 pl-8">├── styles.css</p>
                    <p className="text-gray-400 pl-8">└── script.js</p>
                    <p className="text-gray-400 pl-4">├── <span className="text-emerald-400">Calculator/</span></p>
                    <p className="text-gray-400 pl-8">├── index.html</p>
                    <p className="text-gray-400 pl-8">├── styles.css</p>
                    <p className="text-gray-400 pl-8">└── calculator.js</p>
                    <p className="text-gray-400 pl-4">├── README.md</p>
                    <p className="text-gray-400 pl-4">└── .gitignore</p>
                  </div>
                </div>
              </div>
              
              {/* Code Organization Demo */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Modular Code Organization
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#152822] rounded-lg overflow-hidden">
                    <div className="bg-[#0c1f1a] text-xs text-gray-400 px-3 py-1 flex justify-between">
                      <span>javascript</span>
                      <span>app.js structure</span>
                    </div>
                    <div className="p-3 text-sm">
                      <pre className="text-teal-300">
{`// Constants and Configuration
const CONFIG = {
  storageKey: 'todos-data',
  categories: ['work', 'personal', 'shopping']
};

// DOM Elements
const DOM = {
  todoForm: document.querySelector('#todo-form'),
  todoInput: document.querySelector('#todo-input'),
  todoList: document.querySelector('.todo-list'),
  // ...
};

// Event Listeners
function setupEventListeners() {
  DOM.todoForm.addEventListener('submit', addTodo);
  DOM.todoList.addEventListener('click', handleTodoClick);
  // ...
}

// Core Functions
function addTodo(e) { /* implementation */ }
function handleTodoClick(e) { /* implementation */ }
function filterTodos(category) { /* implementation */ }

// Storage Functions
function saveTodosToStorage(todos) { /* implementation */ }
function getTodosFromStorage() { /* implementation */ }

// Initialize App
function init() {
  setupEventListeners();
  loadSavedTodos();
}

init(); // Start the application`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-[#152822] rounded-lg overflow-hidden">
                    <div className="bg-[#0c1f1a] text-xs text-gray-400 px-3 py-1 flex justify-between">
                      <span>css</span>
                      <span>modular styling</span>
                    </div>
                    <div className="p-3 text-sm">
                      <pre className="text-emerald-300">
{`/* Base Styles */
:root {
  --primary-color: #10b981;
  --secondary-color: #ff6b6b;
  --text-color: #333;
  --bg-color: #f5f5f5;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-color);
}

/* Component Styles */
.todo-container {
  max-width: 600px;
  margin: 2rem auto;
}

.todo-form {
  display: flex;
  margin-bottom: 1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* State Styles */
.todo-item.completed {
  opacity: 0.7;
  text-decoration: line-through;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .todo-form {
    flex-direction: column;
  }
}`}
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
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-[#1f3a32]'
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
                className='bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md'
              >
                {tech}
              </motion.span>
            ))}
          </div>
          
          <div className='mt-6 text-gray-300 leading-relaxed'>
            <p className='mb-3'>
              The Practice Projects repository employs a variety of technologies to build well-rounded development skills. The primary focus is on fundamental web technologies like HTML, CSS, and JavaScript, which serve as the foundation for all projects.
            </p>
            <p className='mb-3'>
              Projects gradually incorporate more advanced concepts including modern JavaScript ES6+ features, DOM manipulation techniques, API integration patterns, and structured data handling. Some projects also explore React components, Node.js basics, and responsive design principles.
            </p>
            
            {/* Tech stack visualization */}
            <div className="mt-8 bg-[#0c1f1a] rounded-lg p-5 border border-[#1f3a32]">
              <h3 className="text-white text-lg font-medium mb-4">Technology Focus Areas</h3>
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Frontend Fundamentals */}
                  <div className="md:col-span-3">
                    <div className="bg-[#152822] p-4 rounded-lg border border-[#1f3a32]">
                      <h4 className="text-emerald-400 text-center font-medium mb-2">Frontend Fundamentals</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">HTML5</div>
                          <div className="text-gray-400 text-xs">Semantic Markup</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">CSS3</div>
                          <div className="text-gray-400 text-xs">Styling & Layouts</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">JavaScript</div>
                          <div className="text-gray-400 text-xs">Interactivity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  <div className="md:col-span-3 flex justify-center">
                    <div className="w-0.5 h-8 bg-[#1f3a32]"></div>
                  </div>
                  
                  {/* Advanced Concepts */}
                  <div className="md:col-span-3">
                    <div className="bg-[#152822] p-4 rounded-lg border border-[#1f3a32]">
                      <h4 className="text-teal-400 text-center font-medium mb-2">Advanced Concepts</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">ES6+ Features</div>
                          <div className="text-gray-400 text-xs">Modern JavaScript</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">API Integration</div>
                          <div className="text-gray-400 text-xs">Data Fetching</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">LocalStorage</div>
                          <div className="text-gray-400 text-xs">Client Data</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  <div className="md:col-span-3 flex justify-center">
                    <div className="w-0.5 h-8 bg-[#1f3a32]"></div>
                  </div>
                  
                  {/* Tools & Development */}
                  <div className="md:col-span-3">
                    <div className="bg-[#152822] p-4 rounded-lg border border-[#1f3a32]">
                      <h4 className="text-emerald-400 text-center font-medium mb-2">Tools & Development</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Git</div>
                          <div className="text-gray-400 text-xs">Version Control</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">VSCode</div>
                          <div className="text-gray-400 text-xs">Development</div>
                        </div>
                        <div className="bg-[#0c1f1a] p-3 rounded text-center">
                          <div className="text-white text-sm mb-1">Chrome DevTools</div>
                          <div className="text-gray-400 text-xs">Debugging</div>
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
          ref={projectsRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-[#1f3a32]'
          id="projects-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Practice Projects</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            The repository contains a collection of focused mini-projects, each designed to reinforce specific skills and concepts. Here are some of the key projects:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {practiceProjects.map((project, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-[#0c1f1a] rounded-lg p-5 border border-[#1f3a32]"
              >
                <h3 className="text-lg text-white font-medium mb-2">{project.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-[#152822] text-emerald-300 px-2 py-1 rounded-md text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Project Status & Progression */}
          <div className="bg-[#0c1f1a] p-5 rounded-lg mb-8">
            <h3 className="text-white text-lg font-medium mb-4">Project Progress</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">HTML/CSS Implementations</span>
                  <span className="text-gray-400">85%</span>
                </div>
                <div className="w-full bg-[#152822] rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">JavaScript Functionality</span>
                  <span className="text-gray-400">70%</span>
                </div>
                <div className="w-full bg-[#152822] rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">API Integration</span>
                  <span className="text-gray-400">60%</span>
                </div>
                <div className="w-full bg-[#152822] rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-white">Advanced Project Complexity</span>
                  <span className="text-gray-400">45%</span>
                </div>
                <div className="w-full bg-[#152822] rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Code Examples */}
          <div className="mt-8">
            <h3 className="text-white text-lg font-medium mb-4">Code Examples</h3>
            <div className="space-y-6">
              {codeSnippets.map((snippet, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <div className="bg-[#152822] px-4 py-2 flex justify-between items-center">
                    <h3 className="text-white font-medium">{snippet.title}</h3>
                    <span className="text-xs text-gray-400 uppercase">{snippet.language}</span>
                  </div>
                  <div className="bg-[#0c1f1a] p-4 overflow-x-auto">
                    <pre className="text-gray-300 text-sm"><code>{snippet.code}</code></pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 bg-emerald-900/20 rounded-lg p-4 border border-emerald-800/40">
            <h3 className="text-emerald-300 font-medium mb-2">Implementation Notes</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Projects follow a consistent structure for organization and maintainability</li>
              <li>• Each mini-project has clear documentation explaining its purpose and functionality</li>
              <li>• Code is organized into logical modules with clear separation of concerns</li>
              <li>• Common utilities are abstracted for reuse across multiple projects</li>
              <li>• Error handling patterns are implemented for robust application behavior</li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          ref={learningsRef}
          className='bg-[#1a1a1a] rounded-lg p-8 mb-10 shadow-lg border border-[#1f3a32]'
          id="learnings-section"
        >
          <h2 className='text-2xl font-bold text-white mb-4'>Learning Journey</h2>
          <p className='text-gray-300 leading-relaxed mb-6'>
            This repository represents my ongoing learning process and skill development in web development.
            Here are key areas of learning and challenges I've encountered along the way.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {learningHighlights.map((item, index) => (
              <div key={index} className="bg-[#0c1f1a] p-5 rounded-lg border border-[#1f3a32]">
                <h3 className="text-emerald-400 font-medium mb-3">{item.area}</h3>
                <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                <div className="bg-[#152822] p-3 rounded-lg border border-[#1f3a32]">
                  <div className="text-xs text-gray-400 mb-1">Challenge:</div>
                  <p className="text-sm text-white">{item.challenge}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#0c1f1a] p-5 rounded-lg border border-[#1f3a32] mb-6">
            <h3 className="text-white text-lg font-medium mb-3">Key Takeaways</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Consistent practice pays off:</strong>{" "}
                  Regular coding exercises have significantly improved my problem-solving abilities and coding efficiency.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Building small leads to building large:</strong>{" "}
                  The principles learned in these mini-projects scale effectively to larger applications.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                <span>
                  <strong className="text-white">Organization matters:</strong>{" "}
                  Structured code and project organization greatly improve maintainability and scalability.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#0c1f1a] p-5 rounded-lg border border-[#1f3a32]">
            <h3 className="text-white text-lg font-medium mb-3">Future Learning Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#152822] p-3 rounded-lg">
                <h4 className="text-emerald-400 text-sm font-medium mb-2">Technical Goals</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-emerald-400 mr-2">•</span>
                    Deep dive into modern JavaScript frameworks
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-400 mr-2">•</span>
                    Expand backend development skills
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-400 mr-2">•</span>
                    Explore testing methodologies and implementation
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-400 mr-2">•</span>
                    Build larger full-stack applications
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#152822] p-3 rounded-lg">
                <h4 className="text-teal-400 text-sm font-medium mb-2">Project Ideas</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">•</span>
                    Real-time collaborative application
                  </li>
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">•</span>
                    E-commerce platform with payment integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">•</span>
                    Progressive Web App with offline capabilities
                  </li>
                  <li className="flex items-center">
                    <span className="text-teal-400 mr-2">•</span>
                    Accessibility-focused UI component library
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-300 hover:text-emerald-400 transition-colors duration-300"
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

export default Practice