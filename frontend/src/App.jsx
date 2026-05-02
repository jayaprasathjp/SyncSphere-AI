import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  CheckSquare, 
  MessageSquare, 
  Zap, 
  Settings, 
  Bell, 
  Search,
  Plus
} from 'lucide-react';
import SidebarItem from './components/SidebarItem';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { TasksPage, ChatPage, WorkflowsPage, SettingsPage, NewTaskModal } from './components/PlaceholderPages';

function App() {
  const [showNewTask, setShowNewTask] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>

      {/* Global New Task Modal */}
      {showNewTask && (
        <NewTaskModal onClose={() => setShowNewTask(false)} onCreated={() => setShowNewTask(false)} />
      )}

      {/* Sidebar Navigation */}
      <nav className="w-72 bg-slate-900/50 border-r border-slate-800/50 flex flex-col p-6 z-20" aria-label="Main Navigation">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20" aria-hidden="true">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SyncSphere</span>
        </div>

        <div className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Team Pulse" to="/" />
          <SidebarItem icon={CheckSquare} label="Tasks & Projects" to="/tasks" />
          <SidebarItem icon={MessageSquare} label="Context Chat" to="/chat" />
          <SidebarItem icon={Zap} label="Workflows" to="/workflows" />
        </div>

        <div className="pt-6 border-t border-slate-800/50 space-y-2">
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <button 
            onClick={() => setShowNewTask(true)}
            className="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 p-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-indigo-500/20 group cursor-pointer" 
            aria-label="Create New Task"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="font-semibold text-sm">New Task</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col relative overflow-hidden" tabIndex={-1}>
        {/* Top Header Bar */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-20">
          <div className="flex items-center bg-slate-900/50 border border-slate-800/50 px-4 py-2 rounded-xl w-96 group focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <Search size={18} className="text-slate-500 group-focus-within:text-indigo-400" aria-hidden="true" />
            <input 
              type="text" 
              placeholder="Search across team knowledge..." 
              className="bg-transparent border-none outline-none ml-3 text-sm text-slate-200 w-full placeholder:text-slate-600"
              aria-label="Search"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative cursor-pointer" aria-label="Notifications">
              <Bell size={20} aria-hidden="true" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" aria-hidden="true"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]" aria-hidden="true">
              <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-sm font-bold text-white">
                JP
              </div>
            </div>
          </div>
        </header>

        {/* Content Routes */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
