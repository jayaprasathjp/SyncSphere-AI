import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
    }
    aria-label={label}
  >
    <Icon size={20} aria-hidden="true" />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

export default SidebarItem;
