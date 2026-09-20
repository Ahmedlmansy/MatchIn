import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Personal Info', path: 'personal-info' },
  { label: 'Skills', path: 'skills' },
  { label: 'Experience', path: 'experience' },
  { label: 'Education', path: 'education' },
  { label: 'Projects', path: 'projects' },
  { label: 'Career Preferences', path: 'career-preferences' },
];

export default function ProfileTabsNav() {
  return (
    <div className="w-full border-b border-gray-100 bg-white px-6 pt-2">
      <nav className="flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `pb-4 px-1 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${
                isActive
                  ? 'text-[#1E3A8A]'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A] rounded-t-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}