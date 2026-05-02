import React, { useState } from 'react';
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
  MoreVertical,
  Activity,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        <span>{trend > 0 ? '+' : ''}{trend}%</span>
        <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-slate-100">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{title}</div>
    </div>
  </motion.div>
);

const TaskItem = ({ title, project, assignee, status, aiSuggested }) => (
  <div className="group bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="text-slate-200 font-medium">{title}</h4>
        <span className="text-xs text-slate-500">{project}</span>
      </div>
      <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical size={16} />
      </button>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
          {assignee}
        </div>
        {aiSuggested && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
            <Sparkles size={10} />
            <span>AI Assigned</span>
          </div>
        )}
      </div>
      <div className={`text-xs px-2 py-1 rounded-md font-medium ${
        status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 
        status === 'Blocked' ? 'bg-rose-500/10 text-rose-400' : 
        'bg-slate-700 text-slate-300'
      }`}>
        {status}
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            SyncSphere
          </span>
        </div>
        
        <div className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Team Pulse" active />
          <SidebarItem icon={CheckSquare} label="Tasks & Projects" />
          <SidebarItem icon={MessageSquare} label="Context Chat" />
          <SidebarItem icon={GitMerge} label="Workflows" />
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl w-96">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search tasks, meetings, or ask AI..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40">
              <Plus size={18} />
              <span>New Task</span>
            </button>
            <div className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8 z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Team Pulse</h1>
                <p className="text-slate-400 text-sm">Real-time overview of your team's workload and health.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-500/20">
                <Activity size={16} />
                <span>Sprint Health: Excellent</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="Active Tasks" value="42" icon={CheckSquare} trend={12} color="indigo" />
              <StatCard title="Blocked Items" value="3" icon={AlertCircle} trend={-5} color="rose" />
              <StatCard title="Team Velocity" value="84 pts" icon={TrendingUp} trend={8} color="emerald" />
              <StatCard title="Engagement Score" value="9.2/10" icon={Users} trend={2} color="purple" />
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Left Column: Task Board */}
              <div className="col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Recommended Actions</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
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
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={100} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" />
                    AI Work Coordinator
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 max-w-md">
                    Detected an overload on Sarah's queue. I've automatically redistributed 2 medium priority tasks to Alex based on his current availability and skill match (React, Node.js).
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      Approve Reassignment
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      Modify
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Activity & Meetings */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Meetings</h2>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div className="text-white font-medium">Daily Standup</div>
                      <div className="text-xs text-slate-400">Ended 10 mins ago</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 mb-3">
                    <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles size={12} /> AI Summary
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Team is on track. John is blocked by the AWS permissions issue. Sarah is starting the new UI components.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckSquare size={14} className="text-emerald-400" />
                      <span>Grant AWS access to John</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckSquare size={14} className="text-emerald-400" />
                      <span>Review UI comps by EOD</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-slate-700/50 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Full Transcript
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
