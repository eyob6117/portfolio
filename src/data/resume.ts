// All site copy lives here so the portfolio can be updated without touching layout code.

export const profile = {
  name: 'Eyob Teklu',
  firstName: 'Eyob',
  lastName: 'Teklu',
  title: 'Senior Mobile Engineer',
  focus: 'iOS (Swift) & React Native',
  location: 'Addis Ababa, Ethiopia',
  email: 'eyobteklu911@gmail.com',
  linkedin: 'https://www.linkedin.com/in/eyob-teklu',
  github: 'https://github.com/eyob6117',
  summary:
    'I build high-performance, secure mobile apps with Swift and React Native. I lead iOS delivery inside the M-Pesa Super App ecosystem serving millions of customers, and I architected a mobile banking super app end to end. A full-stack web background (React, Next.js, TypeScript, Django) means I ship production-grade products from API to App Store.',
};

export const stats = [
  { value: 5, suffix: '+', label: 'Years building software' },
  { value: 2, suffix: '', label: 'Super apps shipped' },
  { value: 1, suffix: 'M+', label: 'Customers reached' },
  { value: 3, suffix: '', label: 'Certifications' },
];

export const skillGroups = [
  {
    name: 'Mobile',
    icon: '📱',
    items: ['Swift', 'UIKit', 'iOS SDK', 'React Native', 'Expo', 'react-native-mmkv', 'react-native-keychain'],
  },
  { name: 'Languages', icon: '⌨️', items: ['JavaScript', 'TypeScript', 'Python', 'SQL'] },
  { name: 'Web / Frontend', icon: '🌐', items: ['React', 'Next.js', 'HTML5', 'CSS3'] },
  { name: 'Backend', icon: '🛠️', items: ['Django', 'Node.js', 'Express', 'REST APIs'] },
  { name: 'Cloud & Tools', icon: '☁️', items: ['AWS', 'Postman', 'RestAssured', 'Unit Testing', 'Agile'] },
  {
    name: 'App Store',
    icon: '🚀',
    items: ['Provisioning', 'Certificates', 'TestFlight', 'App Store Review Guidelines'],
  },
];

// Short labels that orbit the 3D core in the hero.
export const orbitSkills = [
  'Swift', 'React Native', 'TypeScript', 'UIKit', 'Next.js', 'Django', 'AWS', 'Expo', 'Node.js', 'React',
];

export const experience = [
  {
    role: 'Senior Mobile Engineer (React Native)',
    company: 'One Tap Financial Technology',
    place: 'Remote',
    period: 'Sep 2025 – Present',
    points: [
      'Architected and led end-to-end delivery of a customized mobile banking super app, moving it from web-based logic to a high-performance React Native and Swift architecture.',
      'Implemented banking-grade security and encrypted local storage with react-native-mmkv and react-native-keychain.',
      'Owned the full App Store lifecycle: provisioning profiles, certificates, TestFlight betas and App Store Review compliance.',
    ],
    tags: ['React Native', 'Swift', 'Security', 'TestFlight'],
  },
  {
    role: 'Senior Software Developer (iOS)',
    company: 'Safaricom Telecommunications Ethiopia PLC',
    place: 'Addis Ababa, Ethiopia',
    period: 'Oct 2023 – Present',
    points: [
      'Lead iOS design, development and deployment for critical apps within the M-Pesa Super App ecosystem, serving millions of customers.',
      'Designed and shipped Mini-Apps for the M-Pesa Super App, expanding platform functionality.',
      'Delivered a high-traffic lottery platform with Next.js and TypeScript built for large-scale concurrency.',
      'Contributed frontend work to the support portal and CRM across multiple M-Pesa products.',
    ],
    tags: ['Swift', 'UIKit', 'Next.js', 'TypeScript'],
  },
  {
    role: 'React Developer (Freelance)',
    company: 'Touchcore',
    place: 'Remote',
    period: 'Jun 2024 – Oct 2024',
    points: [
      'Built a comprehensive tour-management platform with React and TypeScript for seamless trip planning.',
      'Developed a client-facing platform connecting users with technicians.',
    ],
    tags: ['React', 'TypeScript'],
  },
  {
    role: 'Backend Developer Intern (Django)',
    company: 'ALX Africa',
    place: 'Remote',
    period: 'Jun 2024 – Oct 2024',
    points: [
      'Built a fitness-tracker API with user management, activity tracking and historical data.',
      'Developed a Recipe Management API with secure authentication and advanced search and filtering.',
    ],
    tags: ['Python', 'Django', 'REST'],
  },
  {
    role: 'Integration Support Engineer',
    company: 'Safaricom Telecommunications Ethiopia PLC',
    place: 'Addis Ababa, Ethiopia',
    period: 'Apr 2023 – Sep 2023',
    points: [
      'Enhanced API functionality and optimized data exchange across integrated platforms.',
      'Designed and developed scalable APIs and microservices with cross-functional teams.',
    ],
    tags: ['APIs', 'Microservices'],
  },
  {
    role: 'Frontend Developer & QA Engineer',
    company: 'Gebeya',
    place: 'Addis Ababa, Ethiopia',
    period: 'May 2022 – Mar 2023',
    points: [
      'Built highly responsive React web apps with a consistent experience across devices.',
      'Wrote detailed test plans and cases that reduced post-deployment issues.',
    ],
    tags: ['React', 'QA'],
  },
  {
    role: 'Frontend Developer & Digital Channel Officer',
    company: 'Awash Bank',
    place: 'Addis Ababa, Ethiopia',
    period: 'Aug 2021 – Apr 2022',
    points: [
      'Developed the API and UI for a mobile wallet system, streamlining customer onboarding.',
      'Drove digital banking channel adoption through engagement-focused improvements.',
    ],
    tags: ['Mobile Wallet', 'Fintech'],
  },
];

export const projects = [
  {
    name: 'Mobile Banking Super App',
    blurb:
      'A customized banking super app rebuilt from web-based logic into a native-fast React Native + Swift architecture, with encrypted on-device storage and keychain-backed secrets.',
    tags: ['React Native', 'Swift', 'MMKV', 'Keychain'],
    accent: '#7c5cff',
  },
  {
    name: 'M-Pesa Super App Mini-Apps',
    blurb:
      'Mini-Apps designed and shipped inside one of the largest mobile money ecosystems, extending what millions of customers can do from a single app.',
    tags: ['iOS', 'Swift', 'UIKit'],
    accent: '#00e5c7',
  },
  {
    name: 'AI Incident Management System',
    blurb:
      'An end-to-end platform replacing a legacy vendor tool, using intelligent automation to triage incidents and streamline response in high-traffic environments.',
    tags: ['AI Automation', 'Full-stack'],
    accent: '#ff5c8a',
  },
  {
    name: 'High-Traffic Lottery Platform',
    blurb:
      'A Next.js and TypeScript platform engineered for large-scale concurrent usage during peak draws.',
    tags: ['Next.js', 'TypeScript', 'Scale'],
    accent: '#ffb547',
  },
];

export const certifications = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
  { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' },
  { name: 'Backend Django Development', issuer: 'ALX' },
];

export const education = {
  degree: 'B.Sc. in Electrical and Computer Engineering',
  school: 'Haramaya University',
  period: '2016 – 2021',
};

export const languages = ['English (Proficient)', 'Amharic (Native)'];
