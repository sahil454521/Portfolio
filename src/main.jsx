import { createRoot } from 'react-dom/client';
import './styles/scrollcraft.css';
import './styles/site.css';
import App from './App.jsx';

// No StrictMode: its doubled effects would start the Three.js desk and the
// scroll engine twice in development, and neither is meant to run twice.
createRoot(document.getElementById('root')).render(<App />);
