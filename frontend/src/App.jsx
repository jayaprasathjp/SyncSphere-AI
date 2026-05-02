import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  MessageSquare, 
  GitMerge, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  Sparkles,
  Activity,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import SidebarItem from './components/SidebarItem';
import StatCard from './components/StatCard';
import TaskItem from './components/TaskItem';

function App() {
  const [aiSuggestion, setAiSuggestion] = useState('Analyzing current workload...');

  useEffect(() => {
    const fetchAiSuggestion = async () => {
      try {
        // Fallback or actual fetch to backend
        const res = await fetch('http://localhost:5000/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Generate an alert for team overload.' })
        });
        const data = await res.json();
        if (data.suggestion) {
          setAiSuggestion(data.suggestion);
        }
      } catch (err) {
        setAiSuggestion("Detected an overload on Sarah's queue. I've automatically redistributed 2 medium priority tasks to Alex based on his current availability and skill match (React, Node.js).");
      }
    };
    fetchAiSuggestion();
  }, []);
  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col" aria-label="Main Navigation">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20" aria-hidden="true">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            SyncSphere
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Team Pulse" active />
          <SidebarItem icon={CheckSquare} label="Tasks & Projects" />
          <SidebarItem icon={MessageSquare} label="Context Chat" />
          <SidebarItem icon={GitMerge} label="Workflows" />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative" aria-label="Dashboard Content">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800/50 backdrop-blur-md z-10" role="banner">
          <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl w-96 focus-within:ring-2 focus-within:ring-indigo-500">
            <Search size={18} className="text-slate-500" aria-hidden="true" />
            <input 
              type="search" 
              placeholder="Search tasks, meetings, or ask AI..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500"
              aria-label="Global search"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="w-10 h-10 rounded-xl border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors relative outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Notifications, 1 unread"
            >
              <Bell size={18} aria-hidden="true" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" aria-hidden="true"></span>
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40 outline-none focus:ring-2 focus:ring-indigo-300">
              <Plus size={18} aria-hidden="true" />
              <span>New Task</span>
            </button>
            <button 
              className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="User Profile Menu"
            >
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="" className="w-full h-full object-cover" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8 z-10" role="region" aria-label="Team Pulse Overview">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Team Pulse</h1>
                <p className="text-slate-400 text-sm">Real-time overview of your team's workload and health.</p>
              </div>
              <div 
                className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-500/20"
                role="status"
                aria-label="Sprint Health is Excellent"
              >
                <Activity size={16} aria-hidden="true" />
                <span>Sprint Health: Excellent</span>
              </div>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-4 gap-6" aria-label="Key Metrics">
              <StatCard title="Active Tasks" value="42" icon={CheckSquare} trend={12} color="indigo" />
              <StatCard title="Blocked Items" value="3" icon={AlertCircle} trend={-5} color="rose" />
              <StatCard title="Team Velocity" value="84 pts" icon={TrendingUp} trend={8} color="emerald" />
              <StatCard title="Engagement Score" value="9.2/10" icon={Users} trend={2} color="purple" />
            </section>

            <div className="grid grid-cols-3 gap-8">
              {/* Left Column: Task Board */}
              <section className="col-span-2 space-y-6" aria-labelledby="recommended-actions-heading">
                <div className="flex items-center justify-between">
                  <h2 id="recommended-actions-heading" className="text-xl font-bold text-white">Recommended Actions</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2">View All</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <TaskItem 
                    title="Design Database Schema" 
                    project="SyncSphere Core" 
                    assignee="AL" 
                    status="In Progress"
                    aiSuggested={true}
                  />
                  <TaskItem 
                    title="Setup CI/CD Pipeline" 
                    project="DevOps" 
                    assignee="JD" 
                    status="To Do"
                    aiSuggested={true}
                  />
                  <TaskItem 
                    title="Fix API Rate Limiting" 
                    project="Backend Auth" 
                    assignee="MR" 
                    status="Blocked"
                    aiSuggested={false}
                  />
                  <TaskItem 
                    title="Update User Persona Docs" 
                    project="Marketing" 
                    assignee="SA" 
                    status="Review"
                    aiSuggested={false}
                  />
                </div>
                
                {/* AI Work Coordinator Panel */}
                <section 
                  className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500"
                  aria-labelledby="ai-coordinator-heading"
                  tabIndex="0"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
                    <Sparkles size={100} />
                  </div>
                  <h3 id="ai-coordinator-heading" className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" aria-hidden="true" />
                    AI Work Coordinator
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 max-w-md" aria-live="polite">
                    {aiSuggestion}
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-white">
                      Approve Reassignment
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-slate-400">
                      Modify
                    </button>
                  </div>
                </section>
              </section>

              {/* Right Column: Activity & Meetings */}
              <aside className="space-y-6" aria-labelledby="recent-meetings-heading">
                <h2 id="recent-meetings-heading" className="text-xl font-bold text-white mb-4">Recent Meetings</h2>
                <article className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 focus-within:ring-2 focus-within:ring-indigo-500" tabIndex="0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400" aria-hidden="true">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Daily Standup</h3>
                      <div className="text-xs text-slate-400">Ended 10 mins ago</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 mb-3" role="note" aria-label="AI Summary">
                    <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles size={12} aria-hidden="true" /> AI Summary
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Team is on track. John is blocked by the AWS permissions issue. Sarah is starting the new UI components.
                    </p>
                  </div>
                  <div className="space-y-2" aria-label="Action Items">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckSquare size={14} className="text-emerald-400" aria-hidden="true" />
                      <span>Grant AWS access to John</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckSquare size={14} className="text-emerald-400" aria-hidden="true" />
                      <span>Review UI comps by EOD</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-slate-700/50 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-indigo-500">
                    View Full Transcript
                  </button>
                </article>
              </aside>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
