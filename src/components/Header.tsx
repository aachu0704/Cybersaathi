import React from 'react';
import { Lecturer } from '../types/database';
import { AppView } from '../App';
import { DoorClosed, Radio, Layers, Users, Cpu, ShieldCheck, Home } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isRealtimeActive: boolean;
  lecturers?: Lecturer[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isRealtimeActive,
  lecturers = [],
}) => {
  const availableCount = lecturers.filter((l) => l.status === 'Available').length;
  const busyCount = lecturers.filter((l) => l.status === 'Busy').length;

  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'role-selector', label: 'Overview', icon: Layers },
    { id: 'lecturer', label: 'Lecturer Control', icon: Users },
    { id: 'student', label: 'Student Directory', icon: Users },
    { id: 'iot', label: 'IoT Terminals', icon: Cpu },
    { id: 'admin', label: 'Admin Registry', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Sync Pill */}
        <div
          onClick={() => onNavigate('role-selector')}
          className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">door_sliding</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[17px] text-slate-900 tracking-tight">SmartFaculty IoT</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ESP32 Live Sync
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">Department Corridor Presence System</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-sans">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & User */}
        <div className="flex items-center gap-3 shrink-0 font-sans">
          {lecturers.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {availableCount} Available
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {busyCount} Busy
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{isRealtimeActive ? 'Supabase Connected' : 'Connecting...'}</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              AV
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">Dr. A. Vance</span>
              <span className="text-[10px] text-slate-500">Room 402</span>
            </div>
          </div>

          {/* Quick role switcher button for mobile / small screens */}
          {currentView !== 'role-selector' && (
            <button
              onClick={() => onNavigate('role-selector')}
              className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
