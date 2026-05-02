import React, { useState, useEffect } from 'react';
import { Send, Activity, Plus } from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  const statuses = ['To Do', 'In Progress', 'Review', 'Blocked'];

  if (loading) return <div className="flex-1 flex items-center justify-center"><Activity className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="flex-1 overflow-auto p-8 z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tasks & Projects</h1>
            <p className="text-slate-400 text-sm">Manage and track your team's initiatives.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors">
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
                  <div key={task.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-indigo-400">{task.project}</span>
                      {task.aiSuggested && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">AI</span>}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-3 leading-snug">{task.title}</h3>
                    <div className="flex justify-between items-center">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am SyncSphere AI. Ask me about tasks, team workload, or workflow optimizations.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to my systems right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 z-10 max-h-screen">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-xl font-bold text-white">Context Chat</h1>
          <p className="text-slate-400 text-sm">Powered by Google Vertex AI</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl p-4 flex gap-1">
                <span className="animate-bounce">•</span><span className="animate-bounce" style={{animationDelay: '150ms'}}>•</span><span className="animate-bounce" style={{animationDelay: '300ms'}}>•</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about project status, roadblocks, or team capacity..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" disabled={isTyping || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title, description }) => (
  <div className="flex-1 overflow-auto p-8 z-10">
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm">{description}</p>
      </header>
      <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
        <div className="text-slate-500 mb-4 italic">This feature is currently under active development as part of the SyncSphere AI roadmap.</div>
        <button 
           onClick={() => window.history.back()}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Go Back
        </button>
      </section>
    </div>
  </div>
);

export const WorkflowsPage = () => <PlaceholderPage title="Workflows" description="Automate repetitive team processes with AI-driven pipelines." />;
export const SettingsPage = () => <PlaceholderPage title="Settings" description="Configure your SyncSphere AI instance and integrations." />;
