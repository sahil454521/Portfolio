// Everything the page names, in one place. The desk, the list under the
// headline, the windows and the sections all read from here, so an object on
// the desk and the link that leads to the same thing can never disagree.

export const EMAIL = 'sahilpathak2005@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/sahil-pathak-98a523202';
export const GITHUB = 'https://github.com/sahil454521';

// Every object on the desk. `app` runs live in a window, `compose` opens the
// email form, `board` the status board, `href` goes somewhere, `external`
// opens in a new tab. `menu` is its name in the list under the headline.
export const THINGS = {
  desi: { label: 'Read the Desi Totes case', menu: 'Desi Totes', href: '#work', host: 'desitotes.com' },
  amg: { label: 'Read the AMG case', menu: 'AMG Turnkey', href: '#amg', host: 'amgprojectsllp.com' },
  quest: { label: 'Play Portfolio Quest', menu: 'Play Portfolio Quest', app: 'https://gamifyport.vercel.app', name: 'Portfolio Quest', host: 'gamifyport.vercel.app', still: '/assets/work/quest.jpg' },
  term: { label: 'Run AI Terminal', menu: 'Run AI Terminal', app: 'https://ai-chat-bot-gcar.vercel.app', name: 'AI Terminal', host: 'ai-chat-bot-gcar.vercel.app', still: '/assets/work/terminal.jpg' },
  neura: { label: 'Try NeuraCraft', menu: 'Try NeuraCraft', app: 'https://ai-compiler-eta.vercel.app', name: 'NeuraCraft', host: 'ai-compiler-eta.vercel.app', still: '/assets/work/neura.jpg' },
  paper: { label: 'Read the research', menu: 'The research', href: '#research' },
  cv: { label: 'Open the résumé', menu: 'Résumé', href: '/cv.html' },
  phone: { label: 'Email me', menu: 'Email me', compose: true, href: `mailto:${EMAIL}` },
  rack: { label: 'Check every site', menu: 'Live status', board: true, href: '#status' },
  photo: { label: 'About me', menu: 'About me', href: '#me' },
  books: { label: 'Education', menu: 'Education', href: '/cv.html#cv-edu' },
  trophy: { label: 'Hackathons and prizes', menu: 'Prizes', href: '/cv.html#cv-awards' },
  tote: { label: 'Visit the Desi Totes shop', menu: 'The shop', href: 'https://desitotes.com', external: true, host: 'desitotes.com' },
};
export const MENU = ['desi', 'amg', 'quest', 'term', 'neura', 'paper', 'cv', 'phone', 'rack', 'photo', 'books', 'trophy', 'tote'];

export const CASES = [
  {
    id: 'work', n: '01', tint: 'cotton', name: 'Desi Totes', kind: 'Client project, commerce.',
    href: 'https://desitotes.com', host: 'desitotes.com',
    still: '/assets/work/desi-1.jpg',
    stillAlt: 'The Desi Totes storefront: the Carry It Desi Style hero with a black canvas hobo tote',
    story: 'Cotton canvas, cut and printed after the order arrives. Nothing sits in a warehouse, so nothing can be vague.',
    body: ['Fabric weight, finished size, zip or no zip and the price gap between them all have to land before anyone reaches a cart. It takes cards through Razorpay, switches currency in place, and keeps a bag that survives a refresh.'],
    spec: [['Front', 'React, Vite, Tailwind'], ['Back', 'Node, Express, MongoDB'], ['Payments', 'Razorpay, INR and USD']],
    photos: [
      ['/assets/desi/plain_pocket_tote_natural.jpg', 'A natural cotton canvas tote with a front pocket, standing on a wooden table', 686, 1024, 'Plain pocket tote, natural. 320 GSM.'],
      ['/assets/desi/hobo_black.jpg', 'Black canvas hobo tote', 600, 600, 'Hobo, black'],
      ['/assets/desi/print_daisy_black.jpg', 'Printed tote, black canvas, with a daisy print', 600, 600, 'Daisy print'],
    ],
  },
  {
    id: 'amg', n: '02', tint: 'steel', name: 'AMG Turnkey Projects', kind: 'Software developer, January to June 2025.',
    href: 'https://amgprojectsllp.com', host: 'amgprojectsllp.com',
    still: '/assets/work/amg-1.jpg',
    stillAlt: 'The AMG Turnkey Projects site: the Where Quality Meets Swiftness hero',
    story: 'Twenty five years old, based in Pune, and they build the factory and then fit out the inside of it. Six service lines across three states.',
    body: [
      'The brief was findability. Somebody who needs a hospital block built should reach the right service, the right past project and a way to ask, inside one pass of the page, on a site office connection.',
      'Behind the site I built the civil accounting modules and REST APIs their operations team runs projects on, then found where the app was slow and cut its load time by 50 to 80 percent.',
    ],
    spec: [['Front', 'React, Vite, Tailwind, GSAP'], ['Back', 'Node, Express, MongoDB'], ['Result', 'Load time down 50 to 80%']],
    photos: [
      ['/assets/amg/eka.jpg', 'Inside a completed steel portal frame building, with electric buses on the assembly line below', 1280, 578, 'Pinnacle Mobility Solutions (EKA)'],
      ['/assets/amg/hdfc.jpg', 'A completed open plan office floor, workstations and screens installed', 1600, 1200, 'Corporate office, HDFC'],
      ['/assets/amg/po22.jpg', 'An industrial facility delivered for Plastic Omnium Auto Exteriors', 1280, 960, 'Plastic Omnium Auto Exteriors'],
    ],
  },
];

// What the two client sites carry: the drifting wall
export const CARRY = [
  { image: '/assets/desi/hobo_black.jpg', title: 'Hobo tote, black canvas', href: 'https://desitotes.com' },
  { image: '/assets/amg/eka.jpg', title: 'Steel portal frame plant for Pinnacle Mobility (EKA)', href: 'https://amgprojectsllp.com' },
  { image: '/assets/desi/print_daisy_black.jpg', title: 'Daisy print tote', href: 'https://desitotes.com' },
  { image: '/assets/amg/hdfc.jpg', title: 'Corporate office fit-out for HDFC', href: 'https://amgprojectsllp.com' },
  { image: '/assets/desi/plain_pocket_tote_natural.jpg', title: 'Plain pocket tote, natural cotton', href: 'https://desitotes.com' },
  { image: '/assets/amg/po22.jpg', title: 'Industrial facility for Plastic Omnium', href: 'https://amgprojectsllp.com' },
  { image: '/assets/desi/print_evil_eye_natural.jpg', title: 'Evil eye print tote', href: 'https://desitotes.com' },
  { image: '/assets/amg/acl7.jpg', title: 'A delivered AMG project', href: 'https://amgprojectsllp.com' },
  { image: '/assets/desi/print_emotionalbaggage_natural.jpg', title: 'Emotional baggage print tote', href: 'https://desitotes.com' },
];

export const ALSO = [
  { id: 'neura', name: 'NeuraCraft', verb: 'Try it here', desc: 'A code editor in the browser that suggests machine learning code as you type. A scikit-learn model I trained works out which library you are in, served from FastAPI.' },
  { id: 'term', name: 'AI Terminal', verb: 'Run it here', desc: 'A terminal-style front end for a language model. Chat, pull a URL apart, run commands.' },
  { id: 'quest', name: 'Portfolio Quest', verb: 'Play it here', desc: 'This portfolio as a pixel-art game. Walk the town, enter the buildings, challenge the gym leader for the résumé.' },
];

// The stack, as the folder in the Build section: each tool opens the place
// on the page where it is actually used.
export const STACK = [
  { label: 'PyTorch', value: '#research' },
  { label: 'React', value: '#work' },
  { label: 'Node and Express', value: '#amg' },
  { label: 'FastAPI', value: '#also' },
  { label: 'MongoDB', value: '#work' },
  { label: 'scikit-learn', value: '#also' },
  { label: 'Razorpay', value: '#work' },
  { label: 'Three.js', value: '#top' },
  { label: 'Hugging Face', value: '/cv.html#cv-projects' },
  { label: 'Next.js', value: '#also' },
];

export const SECTIONS = [
  ['#work', 'Work', 2], ['#research', 'Research'], ['#also', 'Also live', 3], ['#build', 'Build'], ['#me', 'About'],
];
