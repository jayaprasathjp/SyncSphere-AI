import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckSquare, AlertCircle, TrendingUp, Users, Sparkles } from 'lucide-react';
import StatCard from './StatCard';
import TaskItem from './TaskItem';

function Dashboard() {
  const navigate = useNavigate();
  const [aiSuggestion, setAiSuggestion] = useState('Analyzing current workload...');
  const [stats, setStats] = useState({
    activeTasks: 0,
    blockedItems: 0,
    teamVelocity: 0,
    engagementScore: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, aiRes] = await Promise.all([
          fetch('http://localhost:5000/api/stats').then(r => r.json()),
          fetch('http://localhost:5000/api/tasks').then(r => r.json()),
          fetch('http://localhost:5000/api/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Generate an alert for team overload.' })
          }).then(r => r.json()).catch(() => ({ suggestion: null }))
        ]);
        
        setStats(statsRes);
        setTasks(tasksRes.slice(0, 4)); // Only show top 4 on dashboard
        
        if (aiRes && aiRes.suggestion) {
          setAiSuggestion(aiRes.suggestion);
        } else {
          setAiSuggestion("Detected an overload on Sarah's queue. I've automatically redistributed 2 medium priority tasks to Alex based on his current availability and skill match (React, Node.js).");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Activity className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
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
          <StatCard 
            title="Active Tasks" 
            value={stats.activeTasks} 
            icon={CheckSquare} 
            trend={stats.trends?.activeTasks || 0} 
            color="indigo" 
          />
          <StatCard 
            title="Blocked Items" 
            value={stats.blockedItems} 
            icon={AlertCircle} 
            trend={stats.trends?.blockedItems || 0} 
            color="rose" 
          />
          <StatCard 
            title="Team Velocity" 
            value={`${stats.teamVelocity} pts`} 
            icon={TrendingUp} 
            trend={stats.trends?.velocity || 0} 
            color="emerald" 
          />
          <StatCard 
            title="Engagement Score" 
            value={`${stats.engagementScore}/10`} 
            icon={Users} 
            trend={stats.trends?.engagement || 0} 
            color="purple" 
          />
        </section>

        <div className="grid grid-cols-3 gap-8">
          <section className="col-span-2 space-y-6" aria-labelledby="recommended-actions-heading">
            <div className="flex items-center justify-between">
              <h2 id="recommended-actions-heading" className="text-xl font-bold text-white">Recommended Actions</h2>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 cursor-pointer"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  title={task.title} 
                  project={task.project} 
                  assignee={task.assignee} 
                  status={task.status} 
                  aiSuggested={task.aiSuggested} 
                />
              ))}
            </div>
            
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
              <p className="text-slate-300 text-sm mb-4 max-w-md" aria-live="polite">{aiSuggestion}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => alert('Optimization Approved! SyncSphere is redistributing tasks...')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-white cursor-pointer"
                >
                  Approve Reassignment
                </button>
                <button 
                  onClick={() => alert('Opening manual adjustment panel...')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                >
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
                  <Activity size={20} />
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
  );
}

export default Dashboard;
