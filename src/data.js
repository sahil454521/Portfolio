export const EMAIL = 'sahilpathak2005@gmail.com';
export const RESUME = '/cv';
export const RESUME_PDF = '/assets/Sahil_Pathak_Resume.pdf';
export const GITHUB = 'https://github.com/sahil454521';
export const LINKEDIN = 'https://www.linkedin.com/in/sahil-pathak21';

// What a recruiter needs first: who, which degrees, what he is looking for.
export const ROLE = 'full-stack and AI/ML engineer';
export const EDUCATION = 'B.Tech in Computer Science at DY Patil International University, with a BSc (Hons) in Data Science and AI at IIT Guwahati alongside';
export const AVAILABILITY = 'Open to internships now and new-grad roles from 2027';
export const PLACE = 'Pune, India. On-site or remote';

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
    body: 'Fabric weight, finished size, zip or no zip and the price gap between them all land before anyone reaches a cart. Behind the storefront: sign-in by one-time code with rate limits, Razorpay payments confirmed by webhook, shipping rates and shipments through Shiprocket, order and return emails, and an admin dashboard for products and orders.',
    specs: [['Front', 'React, TypeScript, Vite, Tailwind'], ['Back', 'Node, Express, MongoDB, Redis'], ['Runs on', 'Razorpay, Shiprocket, S3, Resend']],
    stat: { parts: [{ to: 16 }], label: 'backend modules, from sign-in to returns' },
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
  {
    id: 'saathi',
    name: 'Sarkari Saathi',
    kind: 'Voice AI, October 2026',
    url: 'https://sarkari-saathi-kjgb.onrender.com/',
    host: 'sarkari-saathi-kjgb.onrender.com',
    code: 'https://github.com/sahil454521/sarkari-saathi',
    device: 'phone',
    shots: [
      { src: '/work/saathi-asking.jpg', alt: 'Sarkari Saathi in Marathi, mid-conversation: one spoken sentence has filled age, work, state, family income, ration card colour and a daughter\'s age into the form, and it asks whether she pays income tax.' },
      { src: '/work/saathi-results.jpg', alt: 'Sarkari Saathi\'s results in Marathi: 8 schemes she may qualify for, each card stamped eligible or likely, with the benefit, the documents to carry, a listen button and the official link.' },
    ],
    lede: 'Speak in Marathi, Hindi or English and it finds the government schemes you may qualify for. Made for the people scheme forms assume can read and type.',
    body: 'Gnani\'s speech models hear each answer and read every reply aloud. A small language model only pulls facts out of what was said; plain TypeScript rules, each checked against the scheme\'s official page, decide who qualifies, so it cannot invent a scheme or promise money. It asks next for whatever fact the most undecided schemes are waiting on, usually four to six questions.',
    specs: [['Voice', 'Gnani Prisma and Timbre'], ['Facts', 'An LLM, validated with zod'], ['Rules', 'TypeScript, Express, React; 76 tests']],
    stat: { parts: [{ to: 13 }], label: 'central and Maharashtra schemes, each rule checked against its official page' },
    note: 'Free hosting: the first visit can take a minute to wake up.',
  },
];

export const sideProjects = [
  { id: 'neura', name: 'NeuraCraft', verb: 'Try NeuraCraft', url: 'https://ai-compiler-eta.vercel.app/', code: 'https://github.com/sahil454521/AiCompiler', shot: '/work/neura.webp',
    text: 'A code editor in the browser that suggests machine learning code as you type. A scikit-learn model I trained works out which library you are in, served from FastAPI.' },
  { id: 'terminal', name: 'AI Terminal', verb: 'Run AI Terminal', url: 'https://ai-chat-bot-gcar.vercel.app/', code: 'https://github.com/sahil454521/ai-chat-bot', shot: '/work/terminal.webp',
    text: 'Put any web address after its own and ask about that page: the server fetches it, pulls the text out, and a DeepSeek model answers from it. A Chrome extension does the same from any tab.' },
  { id: 'quest', name: 'Portfolio Quest', verb: 'Play Portfolio Quest', url: 'https://gamifyport.vercel.app/', shot: '/work/quest.webp',
    text: 'This portfolio as a pixel-art game. Walk the town, enter the buildings, challenge the gym leader for the resume.' },
];

// The index under the hero: every project in one line, for the reader with thirty seconds.
// `story` scrolls to the full case on this page.
export const index = [
  { name: 'Desi Totes', kind: 'Client, commerce', line: 'A live store: one-time-code sign-in, Razorpay, Shiprocket shipping and an admin dashboard.', stack: 'React, TypeScript, Node, MongoDB', live: 'https://desitotes.com/', story: 'case-desi' },
  { name: 'AMG Turnkey Projects', kind: 'Client, six months', line: 'Their site, and the accounting modules and APIs their operations team runs projects on. Load time cut 50 to 80%.', stack: 'React, GSAP, Node, MongoDB', live: 'https://amgprojectsllp.com/', story: 'case-amg' },
  { name: 'Sarkari Saathi', kind: 'Voice AI', line: 'Talk in Marathi, Hindi or English; plain rules decide which of 13 schemes you may qualify for.', stack: 'TypeScript, Gnani speech, an LLM', live: 'https://sarkari-saathi-kjgb.onrender.com/', code: 'https://github.com/sahil454521/sarkari-saathi', story: 'case-saathi' },
  { name: 'PPEMDD', kind: 'Research, VIT', line: 'Depression screening from text, EEG, wearables and audio or video in one pass. 91.24% accuracy on 2,250 held-out samples.', stack: 'PyTorch', story: 'research' },
  { name: 'NeuraCraft', kind: 'Own project', line: 'A browser code editor; a scikit-learn model I trained suggests machine learning code as you type.', stack: 'Next.js, FastAPI, scikit-learn', live: 'https://ai-compiler-eta.vercel.app/', code: 'https://github.com/sahil454521/AiCompiler' },
  { name: 'AI Terminal', kind: 'Own project', line: 'Ask about any web page and a DeepSeek model answers from its text. A Chrome extension too.', stack: 'Next.js, Hugging Face', live: 'https://ai-chat-bot-gcar.vercel.app/', code: 'https://github.com/sahil454521/ai-chat-bot' },
  { name: 'Portfolio Quest', kind: 'Own project', line: 'This portfolio as a pixel-art game: walk the town, challenge the gym leader for the résumé.', stack: 'JavaScript, canvas', live: 'https://gamifyport.vercel.app/' },
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
  skills: ['React', 'Vite', 'Tailwind', 'TypeScript', 'GSAP', 'Three.js', 'Node and Express', 'MongoDB', 'Redis', 'Razorpay', 'FastAPI', 'scikit-learn', 'PyTorch', 'Hugging Face', 'TensorFlow', 'Next.js'],
  projects: ['Desi Totes', 'AMG', 'Sarkari Saathi', 'PPEMDD', 'NeuraCraft', 'This site'],
  links: [
    ['React', 'Desi Totes'], ['Vite', 'Desi Totes'], ['Tailwind', 'Desi Totes'], ['TypeScript', 'Desi Totes'], ['Node and Express', 'Desi Totes'], ['MongoDB', 'Desi Totes'], ['Redis', 'Desi Totes'], ['Razorpay', 'Desi Totes'],
    ['React', 'Sarkari Saathi'], ['Vite', 'Sarkari Saathi'], ['Tailwind', 'Sarkari Saathi'], ['TypeScript', 'Sarkari Saathi'], ['Node and Express', 'Sarkari Saathi'],
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
    stack: 'React, TypeScript, Vite, Tailwind over Node, Express, MongoDB, Redis',
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
  Interface: ['React', 'Vite', 'Tailwind', 'TypeScript', 'GSAP', 'Three.js', 'Next.js'],
  Service: ['Node and Express', 'MongoDB', 'Redis', 'Razorpay', 'FastAPI'],
  Models: ['PyTorch', 'scikit-learn', 'Hugging Face', 'TensorFlow'],
};

export const projectInfo = {
  'Desi Totes': { kind: 'Client project, commerce', text: 'Cotton canvas, cut and printed after the order arrives. One-time-code sign-in, Razorpay, Shiprocket and an admin dashboard.', href: 'https://desitotes.com/', cta: 'Visit desitotes.com' },
  'Sarkari Saathi': { kind: 'Voice AI, October 2026', text: 'Talk in Marathi, Hindi or English and it finds the government schemes you may qualify for. The model listens; plain rules decide.', href: 'https://sarkari-saathi-kjgb.onrender.com/', cta: 'Try Sarkari Saathi' },
  AMG: { kind: 'Software developer, January to June 2025', text: 'A turnkey construction firm. The site, plus the accounting modules and REST APIs behind it. Load time down 50 to 80%.', href: 'https://amgprojectsllp.com/', cta: 'Visit amgprojectsllp.com' },
  PPEMDD: { kind: 'Research, VIT, May to July 2026', text: 'Depression screening from text, EEG, wearables and audio or video in one pass. 91.24% accuracy on 2,250 held-out samples.', href: '#research', cta: 'Open the demo' },
  NeuraCraft: { kind: 'Side project', text: 'A browser code editor that suggests machine learning code as you type, from a scikit-learn model served by FastAPI.', href: 'https://ai-compiler-eta.vercel.app/', cta: 'Try NeuraCraft' },
  'This site': { kind: 'You are here', text: 'React, Three.js and GSAP. The particle field, this graph and the gate are all running code.', href: '#top', cta: 'Back to the top' },
};
