"""Management command to seed the database with initial Streva data."""
from django.core.management.base import BaseCommand
from api.models import User, Category, Course, Module, Lesson, Quiz, Badge, Enrollment, UserBadge
from django.db import transaction

CATEGORIES = [
    {'key': 'network',   'label': 'Network Security',  'icon': '🌐', 'color': '#1a2744', 'pill_class': 'pill-purple'},
    {'key': 'hacking',   'label': 'Ethical Hacking',   'icon': '💻', 'color': '#1a1a2e', 'pill_class': 'pill-red'},
    {'key': 'crypto',    'label': 'Cryptography',      'icon': '🔑', 'color': '#1a2a1a', 'pill_class': 'pill-teal'},
    {'key': 'forensics', 'label': 'Digital Forensics', 'icon': '🔍', 'color': '#2a1a1a', 'pill_class': 'pill-gold'},
    {'key': 'malware',   'label': 'Malware Analysis',  'icon': '🦠', 'color': '#251a2a', 'pill_class': 'pill-purple'},
    {'key': 'web',       'label': 'Web App Security',  'icon': '🌍', 'color': '#1a2535', 'pill_class': 'pill-teal'},
]

COURSES = [
    {'title': 'Cybersecurity Fundamentals', 'cat': 'network', 'level': 'Beginner',
     'desc': 'Master the core principles of cybersecurity including CIA triad, threat modeling, and defense-in-depth strategies.',
     'instructor': 'Dr. Ahmed Malik', 'duration': '3h', 'students': 8420, 'rating': 4.9, 'materials': 24},
    {'title': 'Network Security Fundamentals', 'cat': 'network', 'level': 'Intermediate',
     'desc': 'Deep dive into network protocols, firewalls, IDS/IPS systems, and VPN configurations.',
     'instructor': 'Prof. Sara Hassan', 'duration': '4h', 'students': 6200, 'rating': 4.7, 'materials': 32},
    {'title': 'Ethical Hacking & Penetration Testing', 'cat': 'hacking', 'level': 'Intermediate',
     'desc': 'Learn professional penetration testing methodology using Metasploit, Burp Suite, and Nmap.',
     'instructor': 'Usman Khan', 'duration': '8h', 'students': 5100, 'rating': 4.8, 'materials': 45},
    {'title': 'Cryptography & Encryption', 'cat': 'crypto', 'level': 'Intermediate',
     'desc': 'Understand symmetric/asymmetric encryption, PKI, TLS/SSL.',
     'instructor': 'Dr. Nadia Iqbal', 'duration': '5h', 'students': 3800, 'rating': 4.6, 'materials': 28},
    {'title': 'Digital Forensics & Incident Response', 'cat': 'forensics', 'level': 'Advanced',
     'desc': 'Investigate cybercrime using forensic tools, memory analysis, and disk imaging.',
     'instructor': 'Rana Bilal', 'duration': '6h', 'students': 2900, 'rating': 4.7, 'materials': 35},
    {'title': 'Malware Analysis & Reverse Engineering', 'cat': 'malware', 'level': 'Advanced',
     'desc': 'Analyze malware samples using static and dynamic analysis with IDA Pro and x64dbg.',
     'instructor': 'Dr. Kamran Javed', 'duration': '7h', 'students': 2100, 'rating': 4.9, 'materials': 40},
]

QUIZZES = [
    {'q': 'What does the CIA triad stand for in information security?',
     'opts': ['Confidentiality, Integrity, Availability','Central Intelligence Agency','Cipher, Intrusion, Authentication','Control, Identity, Access'],
     'ans': 0, 'exp': 'The CIA triad is the foundational model for information security policies.'},
    {'q': 'Which layer of the OSI model is responsible for routing?',
     'opts': ['Data Link Layer','Transport Layer','Network Layer','Session Layer'],
     'ans': 2, 'exp': 'The Network Layer (Layer 3) handles logical addressing and routing.'},
    {'q': 'What is a Man-in-the-Middle (MITM) attack?',
     'opts': ['Injecting malicious code into a database','Intercepting communication between two parties','Flooding a server with traffic','Guessing passwords by brute force'],
     'ans': 1, 'exp': 'MITM attacks intercept and potentially alter communications between two parties.'},
    {'q': 'Which protocol provides secure remote access to network devices?',
     'opts': ['Telnet','FTP','SSH','SNMP'],
     'ans': 2, 'exp': 'SSH (Secure Shell) encrypts all traffic, unlike Telnet which sends data in plaintext.'},
    {'q': 'What is the purpose of a firewall?',
     'opts': ['Encrypt data at rest','Monitor and filter network traffic','Store backup data securely','Authenticate users'],
     'ans': 1, 'exp': 'Firewalls monitor and control incoming/outgoing network traffic based on security rules.'},
]

BADGES = [
    {'name': 'First Login',   'icon': '🌟', 'desc': 'Joined the platform',            'bg': 'rgba(245,197,24,.2)',  'xp': 50},
    {'name': 'Quick Learner', 'icon': '⚡', 'desc': 'Complete 3 lessons in a day',    'bg': 'rgba(108,71,255,.2)', 'xp': 100},
    {'name': 'Quiz Master',   'icon': '🎯', 'desc': 'Score 100% on any quiz',         'bg': 'rgba(0,217,166,.2)',  'xp': 200},
    {'name': 'Network Pro',   'icon': '🌐', 'desc': 'Complete Network Security course','bg': 'rgba(108,71,255,.2)', 'xp': 250},
    {'name': '7-Day Streak',  'icon': '🔥', 'desc': 'Study 7 days in a row',          'bg': 'rgba(255,107,53,.2)', 'xp': 150},
    {'name': 'PDF Pro',       'icon': '📄', 'desc': 'Upload 5 PDF resources',         'bg': 'rgba(255,107,107,.2)','xp': 80},
    {'name': 'Path Walker',   'icon': '🗺️', 'desc': 'Complete 50% of learning path',  'bg': 'rgba(108,71,255,.2)', 'xp': 150},
    {'name': 'Security+',     'icon': '🛡️', 'desc': 'Pass Security+ practice exam',  'bg': 'rgba(245,197,24,.2)', 'xp': 300},
]

MODULE_TEMPLATE = [
    {'title': 'Module 1: Foundations', 'duration': '1h 20m', 'lessons': [
        {'title': 'Course Introduction & Goals', 'type': 'video', 'dur': '8m', 'free': True},
        {'title': 'Core Security Concepts', 'type': 'reading', 'dur': '15m', 'free': True},
        {'title': 'Threat Landscape Overview', 'type': 'video', 'dur': '22m', 'free': False},
        {'title': 'Lab: Environment Setup', 'type': 'lab', 'dur': '20m', 'free': False},
        {'title': 'Module 1 Assessment', 'type': 'quiz', 'dur': '15m', 'free': False},
    ]},
    {'title': 'Module 2: Core Concepts', 'duration': '1h 45m', 'lessons': [
        {'title': 'Deep Dive Session 1', 'type': 'video', 'dur': '25m', 'free': False},
        {'title': 'Reference Reading', 'type': 'reading', 'dur': '18m', 'free': False},
        {'title': 'Hands-on Lab', 'type': 'lab', 'dur': '30m', 'free': False},
    ]},
    {'title': 'Module 3: Advanced Topics', 'duration': '1h 10m', 'lessons': [
        {'title': 'Advanced Techniques', 'type': 'video', 'dur': '20m', 'free': False},
        {'title': 'Case Studies', 'type': 'reading', 'dur': '15m', 'free': False},
        {'title': 'Final Assessment', 'type': 'quiz', 'dur': '15m', 'free': False},
    ]},
]


class Command(BaseCommand):
    help = 'Seed the database with initial Streva data'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding categories...')
        cat_map = {}
        for c in CATEGORIES:
            obj, _ = Category.objects.get_or_create(key=c['key'], defaults={
                'label': c['label'], 'icon': c['icon'], 'color': c['color'], 'pill_class': c['pill_class'],
            })
            cat_map[c['key']] = obj

        self.stdout.write('Seeding courses + modules + lessons...')
        for cd in COURSES:
            course, created = Course.objects.get_or_create(title=cd['title'], defaults={
                'category': cat_map[cd['cat']], 'level': cd['level'], 'description': cd['desc'],
                'instructor': cd['instructor'], 'duration': cd['duration'],
                'students_count': cd['students'], 'rating': cd['rating'], 'materials_count': cd['materials'],
            })
            if created:
                for mi, md in enumerate(MODULE_TEMPLATE):
                    mod = Module.objects.create(
                        course=course, title=md['title'],
                        lessons_count=len(md['lessons']), duration=md['duration'], order=mi,
                    )
                    for li, ld in enumerate(md['lessons']):
                        Lesson.objects.create(
                            module=mod, title=ld['title'], lesson_type=ld['type'],
                            duration=ld['dur'], is_free=ld['free'], order=li,
                        )

        self.stdout.write('Seeding quizzes...')
        first_course = Course.objects.first()
        for qd in QUIZZES:
            Quiz.objects.get_or_create(question=qd['q'], defaults={
                'options': qd['opts'], 'correct_answer': qd['ans'],
                'explanation': qd['exp'], 'course': first_course,
            })

        self.stdout.write('Seeding badges...')
        for bd in BADGES:
            Badge.objects.get_or_create(name=bd['name'], defaults={
                'icon': bd['icon'], 'description': bd['desc'],
                'background_color': bd['bg'], 'xp_reward': bd['xp'],
            })

        self.stdout.write('Creating demo user...')
        if not User.objects.filter(username='syed.roni').exists():
            user = User.objects.create_user(
                username='syed.roni', password='streva123',
                email='syed@streva.ai', first_name='Syed', last_name='Roni',
                roll_number='2024-CS-001', role='Student',
                xp=2340, level='Intermediate', daily_goal=45, streak=7,
            )
            courses = list(Course.objects.all()[:3])
            for course, prog, stat in zip(courses, [92, 60, 35], ['completed', 'in-progress', 'in-progress']):
                Enrollment.objects.create(user=user, course=course, progress=prog, status=stat)
            for badge_name in ['First Login', 'Quick Learner', 'Quiz Master', '7-Day Streak']:
                UserBadge.objects.create(user=user, badge=Badge.objects.get(name=badge_name))

        self.stdout.write(self.style.SUCCESS('✅ Database seeded! Login: syed.roni / streva123'))
