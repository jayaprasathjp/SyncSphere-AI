import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.article 
    whileHover={{ y: -4 }}
    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4 focus-within:ring-2 focus-within:ring-indigo-500"
    tabIndex="0"
    aria-label={`${title} is ${value}, trending ${trend > 0 ? 'up' : 'down'} by ${Math.abs(trend)}%`}
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div 
        className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}
        aria-hidden="true"
      >
        <span>{trend > 0 ? '+' : ''}{trend}%</span>
        <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-slate-100">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{title}</div>
    </div>
  </motion.article>
);

export default StatCard;
