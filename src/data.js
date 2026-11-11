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

// The proof above the fold: three numbers a reader can check further down the page.
export const proof = [
  ['91.24%', 'accuracy on 2,250 held-out samples, PPEMDD'],
  ['50-80%', 'load time cut on AMG\'s production app'],
  ['6', 'projects live right now, two of them client work'],
];

// Everything on the resume, by row. The graph above only draws skills a project here uses.
export const skillsAll = [
  ['Languages', 'Python, JavaScript, TypeScript, SQL, C++, C, HTML, CSS'],
  ['AI and ML', 'Machine learning, deep learning, NLP, multimodal learning, generative AI, diffusion models, model evaluation'],
  ['ML libraries', 'PyTorch, TensorFlow, Keras, scikit-learn, Hugging Face Transformers, Diffusers, Pandas, NumPy'],
  ['Web', 'React, Next.js, Node.js, Express, FastAPI, Flask, Redux, Tailwind CSS, Vite, REST APIs'],
  ['Data and tools', 'MongoDB, Firebase Firestore, Convex, Git, GitHub, Postman, VS Code, Vercel, Render, CI/CD'],
];

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

export const resume = [
  { when: 'May to July 2026', title: 'Research intern, VIT', points: ['Built PPEMDD end to end: a review of more than twenty papers, the fused multimodal model, an IEEE-format paper.', '91.24% accuracy on a held-out test of 2,250 samples.'] },
  { when: 'January to June 2025', title: 'Software developer, AMG Turnkey Projects', points: ['Civil accounting modules and REST APIs the operations team runs projects on.', 'Found where the app was slow and cut load time by 50 to 80 percent.'] },
  { when: '2023 to 2027', title: 'Education', points: ['B.Tech, Computer Science, DY Patil International University.', 'BSc (Hons), Data Science and AI, IIT Guwahati, running alongside it.'] },
  { when: 'Recognition', title: 'Prizes', points: ['Smart India Hackathon, top 15 in the college round.', 'SharkIndia, prize for an AI solution.', 'FOSS Hackathon 2025, an open-source AI coding assistant.'] },
];
