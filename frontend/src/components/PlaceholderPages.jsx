import React, { useState, useEffect, useRef } from 'react';
import { Send, Activity, Plus, X, Zap, Bell, User, Shield, Palette, Database, CheckCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react';

// Use relative paths so it works in both local dev (proxied) and production
const API = '';

// ─── NEW TASK MODAL ───────────────────────────────────────────────────────────
const NewTaskModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', project: '', assignee: '', status: 'To Do' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const newTask = await res.json();
      onCreated(newTask);
      onClose();
    } catch {
      alert('Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Task Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Design landing page mockup" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Project</label>
            <input value={form.project} onChange={e => setForm({...form, project: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. SyncSphere Core" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Assignee Initials</label>
            <input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. JP" maxLength={3} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500">
              {['To Do', 'In Progress', 'Review', 'Blocked', 'Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-colors mt-2">
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────
export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadTasks = () => {
    fetch(`${API}/api/tasks`)
      .then(res => res.json())
      .then(data => { setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTasks(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const statuses = ['To Do', 'In Progress', 'Review', 'Blocked'];
  const statusColors = {
    'To Do': 'text-slate-400 border-slate-600',
    'In Progress': 'text-blue-400 border-blue-500/50',
    'Review': 'text-amber-400 border-amber-500/50',
    'Blocked': 'text-rose-400 border-rose-500/50',
    'Completed': 'text-emerald-400 border-emerald-500/50',
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Activity className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <>
      {showModal && <NewTaskModal onClose={() => setShowModal(false)} onCreated={t => { setTasks(prev => [t, ...prev]); }} />}
      <div className="flex-1 overflow-auto p-8 z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tasks &amp; Projects</h1>
              <p className="text-slate-400 text-sm">Manage and track your team's initiatives.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors">
              <Plus size={18} /> New Task
            </button>
          </header>

          <div className="grid grid-cols-4 gap-6">
            {statuses.map(status => (
              <div key={status} className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h2 className="font-bold text-white mb-4 flex items-center justify-between">
                  {status}
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md">
                    {tasks.filter(t => t.status === status).length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-indigo-400">{task.project}</span>
                        {task.aiSuggested && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">AI</span>}
                      </div>
                      <h3 className="text-sm font-medium text-white mb-3 leading-snug">{task.title}</h3>
                      <div className="flex justify-between items-center">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {task.assignee}
                        </div>
                        <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                          className={`text-[10px] bg-transparent border rounded-lg px-1.5 py-0.5 cursor-pointer focus:outline-none ${statusColors[task.status] || ''}`}>
                          {['To Do','In Progress','Review','Blocked','Completed'].map(s => <option key={s} className="bg-slate-800 text-white">{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === status).length === 0 && (
                    <div className="text-slate-600 text-xs text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">No tasks here</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── CHAT PAGE ────────────────────────────────────────────────────────────────
export const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am SyncSphere AI powered by Vertex AI (Gemini). Ask me about tasks, team workload, blockers, or workflow optimizations.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, connection error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = ['What are the blocked tasks?', 'How is the team velocity?', 'Suggest workflow improvements', 'Summarize project status'];

  return (
    <div className="flex-1 flex flex-col p-8 z-10" style={{maxHeight:'calc(100vh - 80px)'}}>
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Activity size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Context Chat</h1>
            <p className="text-slate-400 text-xs">Powered by Google Vertex AI · Gemini</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex gap-1 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about project status, blockers, or team capacity..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
            <button type="submit" disabled={isTyping || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── WORKFLOWS PAGE ───────────────────────────────────────────────────────────
const workflowsData = [
  { id: 1, name: 'Auto-Reassign on Block', description: 'When a task is blocked for >24h, automatically suggest reassignment to the least-loaded team member.', trigger: 'Task blocked', action: 'Suggest reassignment', active: true, runs: 42, icon: Zap, color: 'indigo' },
  { id: 2, name: 'Daily Standup Digest', description: 'Every morning at 9 AM, compile blocked tasks and send a digest to team leads.', trigger: 'Daily at 9:00 AM', action: 'Send digest', active: true, runs: 28, icon: Bell, color: 'purple' },
  { id: 3, name: 'Task Completion Velocity', description: 'Recalculate team velocity metrics every time a task is moved to "Completed".', trigger: 'Task completed', action: 'Recalculate metrics', active: false, runs: 15, icon: CheckCircle, color: 'emerald' },
  { id: 4, name: 'Overload Alert', description: 'When a team member has more than 5 active tasks, notify the project manager automatically.', trigger: 'Assignee tasks > 5', action: 'Alert PM', active: true, runs: 7, icon: AlertCircle, color: 'rose' },
];

export const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState(workflowsData);

  const toggle = (id) => setWorkflows(prev => prev.map(w => w.id === id ? {...w, active: !w.active} : w));

  const colorMap = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="flex-1 overflow-auto p-8 z-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Workflows</h1>
            <p className="text-slate-400 text-sm">Automate repetitive processes with AI-driven triggers and actions.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors">
            <Plus size={18} /> New Workflow
          </button>
        </header>

        <div className="grid gap-4">
          {workflows.map(w => {
            const Icon = w.icon;
            return (
              <div key={w.id} className={`bg-slate-900/50 border rounded-2xl p-6 transition-all ${w.active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[w.color]}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-semibold text-lg">{w.name}</h3>
                      <button onClick={() => toggle(w.id)}
                        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all ${w.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                        {w.active ? <Play size={12}/> : <Pause size={12}/>}
                        {w.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 mb-4">{w.description}</p>
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12}/> Trigger: <span className="text-slate-300 ml-1">{w.trigger}</span></span>
                      <span className="flex items-center gap-1"><Zap size={12}/> Action: <span className="text-slate-300 ml-1">{w.action}</span></span>
                      <span className="flex items-center gap-1"><CheckCircle size={12}/> Ran <span className="text-slate-300 mx-1">{w.runs}</span> times</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
export const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: 'Jayaprasath', email: 'jayaprasathjp44@gmail.com', role: 'Admin' });
  const [notifications, setNotifications] = useState({ blockedAlerts: true, dailyDigest: true, velocityReport: false });
  const [aiSettings, setAiSettings] = useState({ model: 'gemini-1.5-flash-001', region: 'us-central1', autoSuggest: true });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-auto p-8 z-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400 text-sm">Configure your SyncSphere AI instance.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-5"><User size={18} className="text-indigo-400"/> Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['Name', 'name', 'Jayaprasath'], ['Email', 'email', 'you@example.com'], ['Role', 'role', 'Admin']].map(([label, key, placeholder]) => (
                <div key={key} className={key === 'email' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
                  <input value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-5"><Bell size={18} className="text-purple-400"/> Notifications</h2>
            <div className="space-y-4">
              {[
                ['blockedAlerts', 'Blocked Task Alerts', 'Get notified when tasks are blocked for over 24 hours.'],
                ['dailyDigest', 'Daily Standup Digest', 'Receive a morning summary of team blockers and progress.'],
                ['velocityReport', 'Weekly Velocity Report', 'Get a weekly email with sprint velocity and trends.'],
              ].map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <button type="button" onClick={() => setNotifications(n => ({...n, [key]: !n[key]}))}
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications[key] ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[key] ? 'left-6' : 'left-0.5'}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI Configuration */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-5"><Database size={18} className="text-emerald-400"/> AI Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Vertex AI Model</label>
                <select value={aiSettings.model} onChange={e => setAiSettings({...aiSettings, model: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="gemini-1.5-flash-001">gemini-1.5-flash-001 (Fast)</option>
                  <option value="gemini-1.5-pro-001">gemini-1.5-pro-001 (Pro)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Region</label>
                <input value={aiSettings.region} readOnly
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Auto AI Suggestions</div>
                  <div className="text-xs text-slate-500">Show AI-powered task recommendations on the dashboard.</div>
                </div>
                <button type="button" onClick={() => setAiSettings(a => ({...a, autoSuggest: !a.autoSuggest}))}
                  className={`w-12 h-6 rounded-full transition-all relative ${aiSettings.autoSuggest ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiSettings.autoSuggest ? 'left-6' : 'left-0.5'}`}></span>
                </button>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4">
            <button type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
              Save Changes
            </button>
            {saved && <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle size={16}/> Settings saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
};
