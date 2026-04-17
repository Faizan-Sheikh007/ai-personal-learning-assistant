import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Onboarding from './components/Onboarding';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import LearningPath from './pages/LearningPath';
import Badges from './pages/Badges';
import Upload from './pages/Upload';
import AITutor from './pages/AITutor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import './styles/globals.css';

function AppShell() {
  const { currentPage } = useApp();
  const [onboarded, setOnboarded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  const pages = {
    dashboard: <Dashboard />,
    courses: <Courses />,
    'course-detail': <CourseDetail />,
    quiz: <Quiz />,
    progress: <Progress />,
    path: <LearningPath />,
    badges: <Badges />,
    upload: <Upload />,
    ai: <AITutor />,
    profile: <Profile />,
    settings: <Settings />,
  };

  return (
    <>
      {/* Animated background */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-bg" />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app">
        <Sidebar isOpen={sidebarOpen} />
        <div className="main">
          <Topbar onToggleSidebar={() => setSidebarOpen(v => !v)} />
          <div className="pb">
            {pages[currentPage] || pages.dashboard}
          </div>
        </div>
      </div>

      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
