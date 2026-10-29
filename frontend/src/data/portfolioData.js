/**
 * Canonical portfolio content for ERKINOV BOBURJON ("ERKINOV LOYIHASI").
 * Ensures the frontend renders 100% standalone on Netlify without requiring a local server,
 * while seamlessly syncing with FastAPI (/api/portfolio & /api/projects) when available.
 */

export const PORTFOLIO_STATIC = {
  brand: 'ERKINOV LOYIHASI',
  owner: 'ERKINOV BOBURJON',
  tagline: 'Interactive 3D Web, Modern Frontend & Python Telegram Bot Engineering',
  backCoverQuote: 'DREAM BIG. BUILD DIFFERENT.',
  socials: {
    telegram: 'https://t.me/Erkinov_1105',
    telegramHandle: '@Erkinov_1105',
    instagram: 'https://www.instagram.com/Erkinov_neww/',
    instagramHandle: '@Erkinov_neww',
    emailPlaceholder: 'your.email@example.com',
    githubPlaceholder: 'https://github.com/your-username',
  },
  about: {
    headline: 'Building High-Impact Web & Telegram Bot Systems',
    paragraphs: [
      'I am Erkinov Boburjon — developer and creator behind ERKINOV LOYIHASI. My work centers on crafting immersive interactive web interfaces, spatial 3D experiences, and dependable Python automation systems.',
      'From personal financial clarity inside Telegram with MoneyFlow to real-time employee attendance operations with SHERDOOR AKFA, every build focuses on speed, clean engineering, and responsive usability across phones and desktops.',
    ],
    pillars: [
      {
        code: '01',
        title: 'Interactive Web & 3D',
        desc: 'Responsive React interfaces enhanced with Three.js spatial depth and smooth motion.',
      },
      {
        code: '02',
        title: 'Telegram Bot Systems',
        desc: 'Practical Python bots automating finance tracking and workforce attendance.',
      },
      {
        code: '03',
        title: 'Clean API Architecture',
        desc: 'Structured backends using FastAPI, PostgreSQL, SQLAlchemy, and Pydantic.',
      },
      {
        code: '04',
        title: 'Mobile-First Craft',
        desc: 'Designed from the ground up for touch gestures, clarity, and fast load times.',
      },
    ],
  },
  skills: [
    { name: 'HTML', category: 'Markup & Structure', accent: '#22d3ee', level: 94 },
    { name: 'CSS', category: 'Responsive Design & UI', accent: '#38bdf8', level: 92 },
    { name: 'JavaScript', category: 'Interactive Logic (ES6+)', accent: '#60a5fa', level: 90 },
    { name: 'React', category: 'Component Architecture', accent: '#818cf8', level: 89 },
    { name: 'Python', category: 'Backend & Automation', accent: '#a855f7', level: 91 },
    { name: 'Three.js', category: '3D WebGL Experiences', accent: '#c084fc', level: 85 },
    { name: 'Telegram Bots', category: 'Conversational Workflows', accent: '#22d3ee', level: 93 },
    { name: 'Git/GitHub', category: 'Version Control & CI', accent: '#3b82f6', level: 88 },
  ],
  journey: [
    {
      step: '01',
      title: 'Core Web Foundations',
      focus: 'HTML • CSS • JavaScript • Git/GitHub',
      detail:
        'Mastered semantic markup, modern responsive layouts, interactive DOM logic, and clean version-controlled workflows.',
    },
    {
      step: '02',
      title: 'Modern React & Spatial 3D Web',
      focus: 'React • Vite • Three.js • GSAP',
      detail:
        'Transitioned into modular single-page applications and interactive 3D WebGL scenes built for performance.',
    },
    {
      step: '03',
      title: 'Python & Telegram Bot Engineering',
      focus: 'Python • Telegram Bot API • PostgreSQL',
      detail:
        'Built structured Python services and conversational Telegram bots that turn routine workflows into instant mobile actions.',
    },
    {
      step: '04',
      title: 'ERKINOV LOYIHASI Shipped Systems',
      focus: 'MoneyFlow & SHERDOOR AKFA',
      detail:
        'Delivered real-world tools under ERKINOV LOYIHASI: MoneyFlow for personal finance management and SHERDOOR AKFA for employee attendance.',
    },
  ],
  technologies: [
    {
      group: 'Frontend & 3D Engine',
      accent: '#22d3ee',
      items: ['React', 'Vite', 'JavaScript', 'Three.js', 'React Three Fiber', 'Drei', 'GSAP', 'HTML', 'CSS'],
    },
    {
      group: 'Backend & Bot Runtime',
      accent: '#a855f7',
      items: ['Python 3.11+', 'FastAPI', 'Telegram Bots', 'SQLAlchemy', 'Pydantic', 'REST APIs'],
    },
    {
      group: 'Database & Cloud Ops',
      accent: '#3b82f6',
      items: ['PostgreSQL', 'Alembic Migrations', 'Git/GitHub', 'Netlify CDN', 'Environment Config'],
    },
  ],
  projects: [
    {
      id: 1,
      slug: 'moneyflow',
      title: 'MoneyFlow',
      subtitle: 'Personal Finance Telegram Bot',
      category: 'FinTech & Telegram Automation',
      status: 'Live',
      book_page: 5,
      live_url: 'https://moneyflow-website.netlify.app',
      summary:
        'Personal finance Telegram bot paired with a live companion website for fast expense/income logging and clear budget tracking.',
      description:
        'MoneyFlow empowers users to track daily income and expenses directly inside Telegram without friction. Featuring structured category tagging, instant balance summaries, interactive bot menus, and a companion web portal deployed on Netlify.',
      technologies: ['Python', 'Telegram Bots', 'JavaScript', 'React', 'HTML', 'CSS', 'Git/GitHub'],
      features: [
        'Instant income & expense recording inside Telegram',
        'Category analytics and clear balance summaries',
        'Interactive inline menus built for mobile speed',
        'Live companion website: moneyflow-website.netlify.app',
      ],
    },
    {
      id: 2,
      slug: 'sherdoor-akfa',
      title: 'SHERDOOR AKFA',
      subtitle: 'Employee Attendance Telegram Bot',
      category: 'Workforce Attendance Automation',
      status: 'Production',
      book_page: 6,
      live_url: null,
      summary:
        'Dedicated employee attendance Telegram bot automating daily staff check-ins, check-outs, and timestamped shift records.',
      description:
        'SHERDOOR AKFA streamlines workforce attendance operations through Telegram. Staff log arrivals and departures directly from their phones while supervisors gain structured, server-timestamped attendance records instead of manual paper logs.',
      technologies: ['Python', 'Telegram Bots', 'PostgreSQL', 'Git/GitHub'],
      features: [
        'Streamlined employee check-in & check-out via Telegram',
        'Reliable server-side shift timestamp verification',
        'Real-time operational attendance visibility',
        'Structured digital records replacing manual sheets',
      ],
    },
  ],
};

/**
 * Exact 10 Logical Pages of the Interactive 3D Book:
 *   Spread 0 (Closed Front) : Page 1 (Front Cover)
 *   Spread 1 (Open)         : Page 2 (Left) + Page 3 (Right)
 *   Spread 2 (Open)         : Page 4 (Left) + Page 5 (Right)
 *   Spread 3 (Open)         : Page 6 (Left) + Page 7 (Right)
 *   Spread 4 (Open)         : Page 8 (Left) + Page 9 (Right)
 *   Spread 5 (Closed Back)  : Page 10 (Back Cover)
 */
export const BOOK_PAGES = [
  { page: 1, spread: 0, side: 'cover', shortLabel: 'Cover', title: 'ERKINOV BOBURJON', subtitle: 'ERKINOV LOYIHASI' },
  { page: 2, spread: 1, side: 'left', shortLabel: 'About', title: 'About Me', subtitle: 'Developer Profile' },
  { page: 3, spread: 1, side: 'right', shortLabel: 'Skills', title: 'Skills', subtitle: 'Core Stack' },
  { page: 4, spread: 2, side: 'left', shortLabel: 'Journey', title: 'My Journey', subtitle: 'Technical Path' },
  { page: 5, spread: 2, side: 'right', shortLabel: 'MoneyFlow', title: 'MoneyFlow', subtitle: 'Personal Finance Bot' },
  { page: 6, spread: 3, side: 'left', shortLabel: 'SHERDOOR', title: 'SHERDOOR AKFA', subtitle: 'Attendance Bot' },
  { page: 7, spread: 3, side: 'right', shortLabel: 'Tech', title: 'Technologies', subtitle: 'Architecture' },
  { page: 8, spread: 4, side: 'left', shortLabel: 'Projects', title: 'Projects', subtitle: 'Selected Works' },
  { page: 9, spread: 4, side: 'right', shortLabel: 'Contact', title: 'Contact', subtitle: 'Connect & Message' },
  { page: 10, spread: 5, side: 'back', shortLabel: 'Back Cover', title: 'Back Cover', subtitle: 'DREAM BIG. BUILD DIFFERENT.' },
];

export function pageToSpread(pageNumber) {
  const clamped = Math.max(1, Math.min(10, Number(pageNumber) || 1));
  if (clamped === 1) return 0;
  if (clamped === 10) return 5;
  return Math.floor(clamped / 2);
}

export function spreadToPrimaryPage(spreadIndex) {
  if (spreadIndex <= 0) return 1;
  if (spreadIndex >= 5) return 10;
  return spreadIndex * 2;
}

export function getVisiblePagesForSpread(spreadIndex) {
  if (spreadIndex <= 0) return [1];
  if (spreadIndex >= 5) return [10];
  return [spreadIndex * 2, spreadIndex * 2 + 1];
}
