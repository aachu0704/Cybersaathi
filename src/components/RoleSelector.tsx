import React, { useState, useMemo } from 'react';
import { Lecturer, LecturerStatus } from '../types/database';
import { StatusBadge } from './ui/StatusBadge';
import { AvatarInitial } from './ui/AvatarInitial';
import { toast } from 'sonner';

interface RoleSelectorProps {
  onSelectRole: (role: 'lecturer' | 'student' | 'iot' | 'admin') => void;
  lecturers: Lecturer[];
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, lecturers }) => {
  const [snapshotFilter, setSnapshotFilter] = useState<'All' | LecturerStatus>('All');

  const availableCount = lecturers.filter((l) => l.status === 'Available').length;
  const busyCount = lecturers.filter((l) => l.status === 'Busy').length;
  const unavailableCount = lecturers.filter((l) => l.status === 'Not Available').length;

  const getDepartment = (name: string, room: string) => {
    if (room.startsWith('C') || name.includes('Ravi') || name.includes('Anita')) return 'Distributed Systems';
    if (room.startsWith('B') || name.includes('Arjun') || name.includes('Vikram')) return 'AI & Robotics Lab';
    if (room.startsWith('A') || name.includes('Priya')) return 'Hardware & IoT Architecture';
    return 'Computer Science';
  };

  const getEmail = (name: string) => {
    const clean = name.toLowerCase().replace(/^(dr\.|prof\.|assoc\.\s*prof\.)\s+/i, '').trim().replace(/\s+/g, '.');
    return `${clean}@faculty.edu`;
  };

  const filteredSnapshot = useMemo(() => {
    if (snapshotFilter === 'All') return lecturers;
    return lecturers.filter((l) => l.status === snapshotFilter);
  }, [lecturers, snapshotFilter]);

  const roleGateways = [
    {
      id: 'lecturer' as const,
      title: 'Lecturer Dashboard',
      description: 'Update your office presence and broadcast messages to corridor hardware.',
      icon: 'co_present',
      actionText: 'Enter Dashboard',
    },
    {
      id: 'student' as const,
      title: 'Student View',
      description: 'Search faculty members, view live consultation hours and room locations.',
      icon: 'search',
      actionText: 'Search Directory',
    },
    {
      id: 'iot' as const,
      title: 'IoT ESP32 Display',
      description: 'Full-screen hardware terminal display preview for physical door screens.',
      icon: 'developer_board',
      actionText: 'Launch Terminal',
    },
    {
      id: 'admin' as const,
      title: 'Admin Panel',
      description: 'Manage faculty directory roster, room allocations, and hardware pairings.',
      icon: 'admin_panel_settings',
      actionText: 'Manage Roster',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 animate-fadeIn font-sans">
      {/* Academic Hero Section */}
      <section className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Department of Computer Science &amp; Engineering
            </span>
            <span className="text-xs text-slate-500 font-mono">Node: ESP32-CORR-04B</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Realtime Active
            </span>
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            Smart Multi-Lecturer Availability Display
          </h1>

          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Check faculty availability across departments and corridor terminals in real time. Faculty updates sync instantly with corridor hardware displays.
          </p>
        </div>

        {/* Uniform Clean Academic Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Faculty */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Faculty</span>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl sm:text-3xl text-slate-900">{lecturers.length}</span>
              <span className="text-xs font-medium text-slate-500">Registered</span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px] text-blue-600">domain</span> Computer Science Wing
            </span>
          </div>

          {/* Available Now */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Available Now</span>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl sm:text-3xl text-emerald-700">{availableCount}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                Walk-in
              </span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span> In Office
            </span>
          </div>

          {/* Busy / Advising */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Busy / Advising</span>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl sm:text-3xl text-amber-700">{busyCount}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                Consultation
              </span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Session in progress
            </span>
          </div>

          {/* Not Available / Out */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Not Available / Out</span>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl sm:text-3xl text-red-700">{unavailableCount}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
                Off Campus
              </span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-red-600"></span> In Lecture Hall
            </span>
          </div>
        </div>
      </section>

      {/* Role Selection Gateway Section */}
      <section className="flex flex-col gap-4" id="role-gateways">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
              Select Your Role Gateway
            </h2>
            <p className="text-sm text-slate-600">
              Access role-specific workflows for faculty, students, or system administrators.
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-500">badge</span>
            University System Auth
          </span>
        </div>

        {/* 4 Uniform Clean White Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleGateways.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectRole(card.id)}
              className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="pt-6 mt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  {card.actionText}{' '}
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Faculty Directory Snapshot & Live Telemetry */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Faculty Presence Roster</h3>
            <p className="text-xs sm:text-sm text-slate-500">Live corridor presence broadcast status for Engineering Wing Level 4.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <button
              onClick={() => setSnapshotFilter('All')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                snapshotFilter === 'All'
                  ? 'font-semibold bg-blue-50 text-blue-700 border border-blue-200'
                  : 'font-medium text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              All ({lecturers.length})
            </button>
            <button
              onClick={() => setSnapshotFilter('Available')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                snapshotFilter === 'Available'
                  ? 'font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'font-medium text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setSnapshotFilter('Busy')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                snapshotFilter === 'Busy'
                  ? 'font-semibold bg-amber-50 text-amber-700 border border-amber-200'
                  : 'font-medium text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Busy ({busyCount})
            </button>
          </div>
        </div>

        {/* Academic Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Faculty Member</th>
                <th className="py-3 px-4">Department / Specialization</th>
                <th className="py-3 px-4">Office Room</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4">Corridor Node</th>
                <th className="py-3 px-5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSnapshot.map((lec) => {
                const dept = getDepartment(lec.name, lec.room);
                const email = getEmail(lec.name);
                const nodeName = `Node #${lec.room.slice(0, 3)}`;

                return (
                  <tr key={lec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <AvatarInitial name={lec.name} size="sm" />
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">{lec.name}</span>
                          <span className="text-xs text-slate-500">{email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{dept}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">Room {lec.room}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{nodeName}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          toast.success(`Broadcast simulation triggered for ${lec.name} (${lec.status})`);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                      >
                        Simulate Sync
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Telemetry Activity Bar at bottom of table */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span className="font-semibold text-slate-800">Active Realtime Channel:</span>
            <span className="text-slate-500 truncate">presence_faculty_live • Ping 24ms • Supabase WS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Last sync: Just now</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold">Synchronized</span>
          </div>
        </div>
      </section>
    </div>
  );
};
