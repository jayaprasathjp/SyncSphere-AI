import React from 'react';
import { MoreVertical, Sparkles } from 'lucide-react';

const TaskItem = ({ title, project, assignee, status, aiSuggested }) => (
  <article 
    className="group bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
    tabIndex="0"
    aria-label={`Task: ${title}, Project: ${project}, Assignee: ${assignee}, Status: ${status}`}
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="text-slate-200 font-medium">{title}</h4>
        <span className="text-xs text-slate-500">{project}</span>
      </div>
      <button 
        className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label={`More options for ${title}`}
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md"
          title={`Assigned to ${assignee}`}
        >
          {assignee}
        </div>
        {aiSuggested && (
          <div 
            className="flex items-center gap-1 text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full"
            role="status"
            aria-label="AI Suggested Task"
          >
            <Sparkles size={10} aria-hidden="true" />
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
  </article>
);

export default TaskItem;
