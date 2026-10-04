export const EMAIL = 'sahilpathak2005@gmail.com';
export const RESUME = '/cv';
export const RESUME_PDF = '/assets/Sahil_Pathak_Resume.pdf';
export const GITHUB = 'https://github.com/sahil454521';
export const LINKEDIN = 'https://www.linkedin.com/in/sahil-pathak21';

export const projects = [
  {
    id: 'desi',
    name: 'Desi Totes',
    kind: 'Client project, commerce',
    url: 'https://desitotes.com/',
    host: 'desitotes.com',
    shot: '/work/desi.webp',
    alt: 'The Desi Totes storefront: the Carry It Desi Style hero with a black canvas hobo tote.',
    lede: 'Cotton canvas, cut and printed after the order arrives. Nothing sits in a warehouse, so nothing can be vague.',
    body: 'Fabric weight, finished size, zip or no zip and the price gap between them all have to land before anyone reaches a cart. It takes cards through Razorpay, switches currency in place, and keeps a bag that survives a refresh.',
    specs: [['Front', 'React, Vite, Tailwind'], ['Back', 'Node, Express, MongoDB'], ['Payments', 'Razorpay, INR and USD']],
    stat: { parts: [{ to: 2 }], label: 'currencies, INR and USD, switched in place' },
  },
  {
    id: 'amg',
    name: 'AMG Turnkey Projects',
    kind: 'Software developer, January to June 2025',
    url: 'https://amgprojectsllp.com/',
    host: 'amgprojectsllp.com',
    shot: '/work/amg.webp',
    alt: 'The AMG Turnkey Projects site: the Where Quality Meets Swiftness hero.',
    lede: 'A Pune firm, twenty-five years in, that builds the factory and then fits out the inside of it. Six service lines across three states.',
    body: 'The brief was findability: the right service, the right past project and a way to ask, inside one pass of the page. Behind it I built the civil accounting modules and REST APIs their operations team runs projects on.',
    specs: [['Front', 'React, Vite, Tailwind, GSAP'], ['Back', 'Node, Express, MongoDB'], ['Result', 'Load time down 50 to 80%']],
    stat: { parts: [{ to: 50 }, { to: 80, suffix: '%' }], label: 'cut from load time, after finding the slow paths' },
  },
];

export const sideProjects = [
  { id: 'neura', name: 'NeuraCraft', verb: 'Try NeuraCraft', url: 'https://ai-compiler-eta.vercel.app/', shot: '/work/neura.webp',
    text: 'A code editor in the browser that suggests machine learning code as you type. A scikit-learn model I trained works out which library you are in, served from FastAPI.' },
  { id: 'terminal', name: 'AI Terminal', verb: 'Run AI Terminal', url: 'https://ai-chat-bot-gcar.vercel.app/', shot: '/work/terminal.webp',
    text: 'A terminal-style front end for a language model. Chat, pull a URL apart, run commands.' },
  { id: 'quest', name: 'Portfolio Quest', verb: 'Play Portfolio Quest', url: 'https://gamifyport.vercel.app/', shot: '/work/quest.webp',
    text: 'This portfolio as a pixel-art game. Walk the town, enter the buildings, challenge the gym leader for the resume.' },
];

// The live panel: the same five sites server/status.js checks.
export const liveSites = [
  ['desitotes.com', 'https://desitotes.com/'],
  ['amgprojectsllp.com', 'https://amgprojectsllp.com/'],
  ['NeuraCraft', 'https://ai-compiler-eta.vercel.app/'],
  ['AI Terminal', 'https://ai-chat-bot-gcar.vercel.app/'],
  ['Portfolio Quest', 'https://gamifyport.vercel.app/'],
];

export const strands = [
  ['Interface', 'React, Next.js and Vite, Tailwind, GSAP and Three.js where motion carries meaning.'],
  ['Service', 'Node and Express, FastAPI and Flask, over MongoDB, Firestore or Convex.'],
  ['Models', 'PyTorch, TensorFlow and Hugging Face; scikit-learn when a small model is right.'],
  ['Running', 'Vercel and Render, CI on every push, then fixing it in production.'],
];

// Skill -> project links only where the project actually uses it.
export const graph = {
  skills: ['React', 'Vite', 'Tailwind', 'GSAP', 'Three.js', 'Node and Express', 'MongoDB', 'Razorpay', 'FastAPI', 'scikit-learn', 'PyTorch', 'Hugging Face', 'TensorFlow', 'Next.js'],
  projects: ['Desi Totes', 'AMG', 'PPEMDD', 'NeuraCraft', 'This site'],
  links: [
    ['React', 'Desi Totes'], ['Vite', 'Desi Totes'], ['Tailwind', 'Desi Totes'], ['Node and Express', 'Desi Totes'], ['MongoDB', 'Desi Totes'], ['Razorpay', 'Desi Totes'],
    ['React', 'AMG'], ['Vite', 'AMG'], ['Tailwind', 'AMG'], ['GSAP', 'AMG'], ['Node and Express', 'AMG'], ['MongoDB', 'AMG'],
    ['PyTorch', 'PPEMDD'],
    ['scikit-learn', 'NeuraCraft'], ['FastAPI', 'NeuraCraft'],
    ['React', 'This site'], ['Vite', 'This site'], ['GSAP', 'This site'], ['Three.js', 'This site'],
  ],
};

export const resume = [
  { when: 'May to July 2026', title: 'Research intern, VIT', points: ['Built PPEMDD end to end: a review of more than twenty papers, the fused multimodal model, an IEEE-format paper.', '91.24% accuracy on a held-out test of 2,250 samples.'] },
  { when: 'January to June 2025', title: 'Software developer, AMG Turnkey Projects', points: ['Civil accounting modules and REST APIs the operations team runs projects on.', 'Found where the app was slow and cut load time by 50 to 80 percent.'] },
  { when: '2023 to 2027', title: 'Education', points: ['B.Tech, Computer Science, DY Patil International University.', 'BSc (Hons), Data Science and AI, IIT Guwahati, running alongside it.'] },
  { when: 'Recognition', title: 'Prizes', points: ['Smart India Hackathon, top 15 in the college round.', 'SharkIndia, prize for an AI solution.'] },
];

// X-ray chapter: what sits underneath each live site. Boxes are % of the screenshot (x, y, w, h).
export const xray = [
  {
    id: 'desi', name: 'Desi Totes', shot: '/work/desi.webp', url: 'https://desitotes.com/',
    alt: 'The Desi Totes storefront.',
    notes: [
      { box: [66.5, 8.8, 10.5, 5], label: 'INR and USD, switched in place' },
      { box: [85.5, 8.6, 11.8, 5.2], label: 'A bag that survives a refresh' },
      { box: [2.8, 74, 40.4, 13.6], label: 'Zip or no zip, and the price gap, settled before the cart' },
      { box: [2.8, 92.6, 20, 6.6], label: 'Cards through Razorpay' },
      { box: [53, 31, 44, 68], label: 'Cut and printed after the order arrives' },
    ],
    stack: 'React, Vite, Tailwind over Node, Express, MongoDB',
  },
  {
    id: 'amg', name: 'AMG Turnkey Projects', shot: '/work/amg.webp', url: 'https://amgprojectsllp.com/',
    alt: 'The AMG Turnkey Projects site.',
    notes: [
      { box: [26, 1, 70, 8.5], label: 'The right service and past project, in one pass' },
      { box: [43, 45.5, 14, 7], label: 'A way to ask, from the first screen' },
      { box: [31, 11, 38, 30], label: 'Behind it: civil accounting modules and REST APIs' },
      { box: [8.5, 59, 83, 41], label: 'App load time cut by 50 to 80 percent' },
    ],
    stack: 'React, Vite, Tailwind, GSAP over Node, Express, MongoDB',
  },
];

export const skillGroups = {
  Interface: ['React', 'Vite', 'Tailwind', 'GSAP', 'Three.js', 'Next.js'],
  Service: ['Node and Express', 'MongoDB', 'Razorpay', 'FastAPI'],
  Models: ['PyTorch', 'scikit-learn', 'Hugging Face', 'TensorFlow'],
};

export const projectInfo = {
  'Desi Totes': { kind: 'Client project, commerce', text: 'Cotton canvas, cut and printed after the order arrives. Cards through Razorpay, INR and USD.', href: 'https://desitotes.com/', cta: 'Visit desitotes.com' },
  AMG: { kind: 'Software developer, January to June 2025', text: 'A turnkey construction firm. The site, plus the accounting modules and REST APIs behind it. Load time down 50 to 80%.', href: 'https://amgprojectsllp.com/', cta: 'Visit amgprojectsllp.com' },
  PPEMDD: { kind: 'Research, VIT, May to July 2026', text: 'Depression screening from text, EEG, wearables and audio or video in one pass. 91.24% accuracy on 2,250 held-out samples.', href: '#research', cta: 'Open the demo' },
  NeuraCraft: { kind: 'Side project', text: 'A browser code editor that suggests machine learning code as you type, from a scikit-learn model served by FastAPI.', href: 'https://ai-compiler-eta.vercel.app/', cta: 'Try NeuraCraft' },
  'This site': { kind: 'You are here', text: 'React, Three.js and GSAP. The particle field, this graph and the gate are all running code.', href: '#top', cta: 'Back to the top' },
};
