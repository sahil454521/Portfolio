import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Navbar from './components/Navbar'
import AiEcom from './projects/AiEcom'
import Projects from './pages/Projects'
import ImageGen from './projects/ImageGen'
import YoutubeClone from './projects/YoutubeClone'

function App() {
  return (
    <Router>
      <div className="bg-[#111111] min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/ai-ecom" element={<AiEcom />} />
          <Route path="/image-gen" element={<ImageGen />} />
          <Route path="/youtube-clone" element={<YoutubeClone />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
