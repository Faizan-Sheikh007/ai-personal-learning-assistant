// ─── USER ─────────────────────────────────
export const defaultUser = {
  name: 'Syed Roni',
  email: 'syed@streva.ai',
  roll: '2024-CS-001',
  role: 'Student',
  xp: 2340,
  level: 'Intermediate',
  dailyGoal: 45,
  streak: 7,
};

// ─── CATEGORY META ────────────────────────
export const CAT_META = {
  network:  { label: 'Network Security',    icon: '🌐', color: '#1a2744', pill: 'pill-purple' },
  hacking:  { label: 'Ethical Hacking',     icon: '💻', color: '#1a1a2e', pill: 'pill-red'    },
  crypto:   { label: 'Cryptography',        icon: '🔑', color: '#1a2a1a', pill: 'pill-teal'   },
  forensics:{ label: 'Digital Forensics',   icon: '🔍', color: '#2a1a1a', pill: 'pill-gold'   },
  malware:  { label: 'Malware Analysis',    icon: '🦠', color: '#251a2a', pill: 'pill-purple' },
  web:      { label: 'Web App Security',    icon: '🌍', color: '#1a2535', pill: 'pill-teal'   },
};

// ─── COURSES ──────────────────────────────
export const INITIAL_COURSES = [
  { id:1, title:'Cybersecurity Fundamentals', cat:'network', level:'Beginner', desc:'Master the core principles of cybersecurity including CIA triad, threat modeling, and defense-in-depth strategies.', instructor:'Dr. Ahmed Malik', progress:92, duration:'3h', students:8420, rating:4.9, materials:24, status:'completed' },
  { id:2, title:'Network Security Fundamentals', cat:'network', level:'Intermediate', desc:'Deep dive into network protocols, firewalls, IDS/IPS systems, and VPN configurations for enterprise environments.', instructor:'Prof. Sara Hassan', progress:60, duration:'4h', students:6200, rating:4.7, materials:32, status:'in-progress' },
  { id:3, title:'Ethical Hacking & Penetration Testing', cat:'hacking', level:'Intermediate', desc:'Learn professional penetration testing methodology using industry-standard tools like Metasploit, Burp Suite, and Nmap.', instructor:'Usman Khan', progress:35, duration:'8h', students:5100, rating:4.8, materials:45, status:'in-progress' },
  { id:4, title:'Cryptography & Encryption', cat:'crypto', level:'Intermediate', desc:'Understand symmetric/asymmetric encryption, PKI, TLS/SSL, and how cryptographic algorithms protect data in transit.', instructor:'Dr. Nadia Iqbal', progress:0, duration:'5h', students:3800, rating:4.6, materials:28, status:'not-started' },
  { id:5, title:'Digital Forensics & Incident Response', cat:'forensics', level:'Advanced', desc:'Investigate cybercrime using forensic tools, memory analysis, and disk imaging techniques.', instructor:'Rana Bilal', progress:0, duration:'6h', students:2900, rating:4.7, materials:35, status:'not-started' },
  { id:6, title:'Malware Analysis & Reverse Engineering', cat:'malware', level:'Advanced', desc:'Analyze malware samples using static and dynamic analysis techniques with IDA Pro and x64dbg.', instructor:'Dr. Kamran Javed', progress:0, duration:'7h', students:2100, rating:4.9, materials:40, status:'not-started' },
];

// ─── QUIZ BANK ────────────────────────────
export const QUIZ_BANK = [
  { q:'What does the CIA triad stand for in information security?', opts:['Confidentiality, Integrity, Availability','Central Intelligence Agency','Cipher, Intrusion, Authentication','Control, Identity, Access'], ans:0, exp:'The CIA triad is the foundational model for information security policies.' },
  { q:'Which layer of the OSI model is responsible for routing packets between networks?', opts:['Data Link Layer','Transport Layer','Network Layer','Session Layer'], ans:2, exp:'The Network Layer (Layer 3) handles logical addressing and routing between different networks.' },
  { q:'What is a Man-in-the-Middle (MITM) attack?', opts:['Injecting malicious code into a database','Intercepting communication between two parties','Flooding a server with traffic','Guessing passwords by brute force'], ans:1, exp:'MITM attacks intercept and potentially alter communications between two parties.' },
  { q:'Which protocol provides secure remote access to network devices?', opts:['Telnet','FTP','SSH','SNMP'], ans:2, exp:'SSH (Secure Shell) encrypts all traffic, unlike Telnet which sends data in plaintext.' },
  { q:'What is the purpose of a firewall?', opts:['Encrypt data at rest','Monitor and filter network traffic','Store backup data securely','Authenticate users'], ans:1, exp:'Firewalls monitor and control incoming/outgoing network traffic based on security rules.' },
];

// ─── CURRICULUM ───────────────────────────
export const CURRICULUM = [
  {
    title: 'Module 1: Foundations', lessons: 5, duration: '1h 20m',
    items: [
      { title: 'Course Introduction & Goals', type: 'video', dur: '8m', free: true },
      { title: 'Core Security Concepts', type: 'reading', dur: '15m', free: true },
      { title: 'Threat Landscape Overview', type: 'video', dur: '22m', free: false },
      { title: 'Lab: Environment Setup', type: 'lab', dur: '20m', free: false },
      { title: 'Module 1 Assessment', type: 'quiz', dur: '15m', free: false },
    ]
  },
  {
    title: 'Module 2: Network Protocols', lessons: 6, duration: '1h 45m',
    items: [
      { title: 'TCP/IP Deep Dive', type: 'video', dur: '25m', free: false },
      { title: 'DNS & HTTP Security', type: 'reading', dur: '18m', free: false },
      { title: 'Wireshark Basics', type: 'video', dur: '30m', free: false },
    ]
  },
  {
    title: 'Module 3: Threat Modeling', lessons: 4, duration: '1h 10m',
    items: [
      { title: 'STRIDE Framework', type: 'video', dur: '20m', free: false },
      { title: 'Attack Trees', type: 'reading', dur: '15m', free: false },
    ]
  },
];

// ─── BADGES ───────────────────────────────
export const BADGES_DATA = [
  { name:'First Login', icon:'🌟', desc:'Joined the platform', earned:true, bg:'rgba(245,197,24,.2)', xp:50 },
  { name:'Quick Learner', icon:'⚡', desc:'Complete 3 lessons in a day', earned:true, bg:'rgba(108,71,255,.2)', xp:100 },
  { name:'Quiz Master', icon:'🎯', desc:'Score 100% on any quiz', earned:true, bg:'rgba(0,217,166,.2)', xp:200 },
  { name:'Network Pro', icon:'🌐', desc:'Complete Network Security course', earned:false, bg:'rgba(108,71,255,.2)', xp:250 },
  { name:'7-Day Streak', icon:'🔥', desc:'Study 7 days in a row', earned:true, bg:'rgba(255,107,53,.2)', xp:150 },
  { name:'PDF Pro', icon:'📄', desc:'Upload 5 PDF resources', earned:false, bg:'rgba(255,107,107,.2)', xp:80 },
  { name:'Path Walker', icon:'🗺️', desc:'Complete 50% of learning path', earned:false, bg:'rgba(108,71,255,.2)', xp:150 },
  { name:'Security+', icon:'🛡️', desc:'Pass Security+ practice exam', earned:false, bg:'rgba(245,197,24,.2)', xp:300 },
];

// ─── REVIEWS ──────────────────────────────
export const REVIEWS = [
  { name:'Fatima Z.', rating:5, date:'2 days ago', text:'Absolutely the best cybersecurity course. The AI tutor feature is a game changer!' },
  { name:'Ahmed K.', rating:5, date:'1 week ago', text:'The curriculum is very well structured. I especially loved the hands-on labs.' },
  { name:'Sarah M.', rating:4, date:'2 weeks ago', text:'Great content overall. Would love even more lab exercises. The AI insights are surprisingly accurate.' },
];

// ─── AI RESPONSES ────────────────────────
export const AI_RESPONSES = {
  osi: 'The OSI Model has 7 layers: Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7). Remember: "Please Do Not Throw Sausage Pizza Away" 🍕',
  mitm: 'A Man-in-the-Middle (MITM) attack occurs when an attacker secretly intercepts communication between two parties. Prevention: Use HTTPS, HSTS, certificate pinning, and VPNs.',
  aes: 'AES (Advanced Encryption Standard) uses a symmetric key algorithm with block sizes of 128 bits and key sizes of 128, 192, or 256 bits. It performs multiple rounds of substitution, permutation, mixing, and key addition.',
  quiz: 'Here\'s a quick question:\n\n📝 What does "CIA" stand for in information security?\n\nA) Confidentiality, Integrity, Availability ✓\nB) Central Intelligence Agency\nC) Cipher, Intrusion, Authentication\n\nAnswer: A! The CIA Triad is the foundation of InfoSec.',
};
