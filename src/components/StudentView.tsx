import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Lecturer, LecturerStatus } from '../types/database';
import { StatusBadge } from './ui/StatusBadge';
import { AvatarInitial } from './ui/AvatarInitial';
import { toast } from 'sonner';

interface StudentViewProps {
  lecturers: Lecturer[];
  onBack: () => void;
  isRealtimeActive: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({
  lecturers,
  onBack,
  isRealtimeActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy' | 'away'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [scheduleModalLecturer, setScheduleModalLecturer] = useState<Lecturer | null>(null);
  const [mapModalLecturer, setMapModalLecturer] = useState<Lecturer | null>(null);
  const [noticeModalLecturer, setNoticeModalLecturer] = useState<Lecturer | null>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const departmentList = [
    { id: 'all', label: 'All Departments' },
    { id: 'Computer Science', label: 'Computer Science' },
    { id: 'Robotics & AI', label: 'Robotics & AI' },
    { id: 'Electrical Engineering', label: 'Electrical Engineering' },
    { id: 'Data Science', label: 'Data Science' },
  ];

  // Map lecturer to department and simulated room metadata
  const getLecturerMetadata = (name: string, room: string) => {
    if (room.startsWith('C') || name.includes('Ravi') || name.includes('Anita')) {
      return {
        dept: 'Computer Science',
        title: 'Professor • Computer Science',
        fullRoom: `Room ${room} - Distributed Systems Lab`,
        motionPill: 'Motion Detected',
        hours: 'Today: 14:00 - 17:00',
        availabilityTag: 'Walk-ins Welcome',
        note: '“Consulting for CSE408 IoT Capstone students. Step in directly.”',
      };
    }
    if (room.startsWith('B') || name.includes('Arjun') || name.includes('Vikram')) {
      return {
        dept: 'Robotics & AI',
        title: 'Dept Chair • Robotics & AI',
        fullRoom: `Room ${room} - Turing AI Center`,
        motionPill: 'ESP32 Sync: 12ms',
        hours: 'Today: 13:00 - 16:30',
        availabilityTag: 'Lab Active',
        note: '“Hardware lab open for thesis review and ESP32 board checkout. Oscilloscopes ready.”',
      };
    }
    if (room.startsWith('A') || name.includes('Priya')) {
      return {
        dept: 'Electrical Engineering',
        title: 'Associate Professor • Electrical Engineering',
        fullRoom: `Room ${room} - Hardware Wing`,
        motionPill: 'Lecture: Hall C',
        hours: 'Today: 13:00 - 18:00',
        availabilityTag: 'Returns 15:30',
        note: '“Currently off campus or conducting external circuit architecture lectures.”',
      };
    }
    return {
      dept: 'Data Science',
      title: 'Senior Lecturer • Data Science',
      fullRoom: `Room ${room} - Innovation Hub`,
      motionPill: 'In Consultation',
      hours: 'Today: 11:00 - 15:00',
      availabilityTag: '2 In Queue (~15m)',
      note: '“Reviewing grant proposals. Please join virtual queue for 10m consultation slots.”',
    };
  };

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((l) => {
      const q = searchQuery.toLowerCase();
      const meta = getLecturerMetadata(l.name, l.room);
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        l.room.toLowerCase().includes(q) ||
        meta.dept.toLowerCase().includes(q) ||
        meta.fullRoom.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'available') matchesStatus = l.status === 'Available';
      if (statusFilter === 'busy') matchesStatus = l.status === 'Busy';
      if (statusFilter === 'away') matchesStatus = l.status === 'Not Available';

      const matchesDept = departmentFilter === 'all' || meta.dept === departmentFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [lecturers, searchQuery, statusFilter, departmentFilter]);

  const counts = useMemo(() => {
    return {
      all: lecturers.length,
      available: lecturers.filter((l) => l.status === 'Available').length,
      busy: lecturers.filter((l) => l.status === 'Busy').length,
      unavailable: lecturers.filter((l) => l.status === 'Not Available').length,
    };
  }, [lecturers]);

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans">
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Overview</span>
        </button>

        {/* Live sync badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Realtime • No Refresh Needed</span>
        </div>
      </div>

      {/* Directory Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Real-time Telemetry Synchronized
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty Availability Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Search, filter, and inspect real-time availability of university professors and teaching staff.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
          <span className="font-medium text-slate-700">Campus Relay:</span>
          <span>Dual PIR + Door Sensors Active</span>
        </div>
      </div>

      {/* Controls Hub: Search & Filter Pills */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by lecturer name or room number (e.g. Ravi, C204)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm pl-10 pr-28 py-2.5 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
              <kbd className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 border border-slate-200 rounded text-slate-500">
                Press / to search
              </kbd>
            </div>
          </div>

          {/* Status Summary Chips (Filterable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap cursor-pointer shadow-xs ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>Available ({counts.available})
            </button>
            <button
              onClick={() => setStatusFilter('busy')}
              className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'busy'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>Busy ({counts.busy})
            </button>
            <button
              onClick={() => setStatusFilter('away')}
              className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === 'away'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>Not Available ({counts.unavailable})
            </button>
          </div>
        </div>

        {/* Academic Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 pr-1">
            Departments:
          </span>
          {departmentList.map((dept) => {
            const isActive = departmentFilter === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setDepartmentFilter(dept.id)}
                className={`px-3 py-1 rounded-full text-xs transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'font-semibold bg-slate-900 text-white'
                    : 'font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Faculty Cards Grid */}
      {filteredLecturers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLecturers.map((lec) => {
            const meta = getLecturerMetadata(lec.name, lec.room);
            const isAvailable = lec.status === 'Available';
            const isBusy = lec.status === 'Busy';

            return (
              <div
                key={lec.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header: Avatar, Name, Title, Clean Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarInitial name={lec.name} size="md" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {lec.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                          {meta.title}
                        </p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <StatusBadge status={lec.status} size="sm" />
                  </div>

                  {/* Details Block */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          meeting_room
                        </span>
                        {meta.fullRoom}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        isAvailable
                          ? 'bg-white text-slate-600 border-slate-200'
                          : isBusy
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {meta.motionPill}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          schedule
                        </span>
                        {meta.hours}
                      </span>
                      <span className={`font-semibold ${
                        isAvailable ? 'text-emerald-700' : isBusy ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        {meta.availabilityTag}
                      </span>
                    </div>
                  </div>

                  {/* Note */}
                  <p className="text-xs text-slate-600 italic">
                    {meta.note}
                  </p>
                </div>

                {/* Uniform Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2">
                  {isAvailable ? (
                    <button
                      onClick={() => setScheduleModalLecturer(lec)}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      Schedule Appointment
                    </button>
                  ) : isBusy ? (
                    <button
                      onClick={() => {
                        toast.success(`Joined virtual consultation queue for ${lec.name} (Position #3).`);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">group_add</span>
                      Join Virtual Queue (#3)
                    </button>
                  ) : (
                    <button
                      onClick={() => setNoticeModalLecturer(lec)}
                      className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      Leave Callback Note
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMapModalLecturer(lec)}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] text-slate-400">map</span>
                      View Room Map
                    </button>
                    <button
                      onClick={() => setNoticeModalLecturer(lec)}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] text-slate-400">chat</span>
                      Send Notice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <span className="material-symbols-outlined text-[36px] text-slate-300 mx-auto mb-2 block">
            search_off
          </span>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No faculty found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No lecturers match your query "{searchQuery}". Try searching another name or reset filters.
          </p>
        </div>
      )}

      {/* Directory Summary Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-2">
        <span>Showing {filteredLecturers.length} of {lecturers.length} faculty members</span>
        <span>Alphabetically synchronized</span>
      </div>

      {/* Schedule Consultation Modal */}
      {scheduleModalLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Schedule Consultation
                  </h4>
                  <p className="text-xs text-slate-500">
                    {scheduleModalLecturer.name} • Room {scheduleModalLecturer.room}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScheduleModalLecturer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Current Office Status:</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={scheduleModalLecturer.status} size="sm" />
                <span className="text-slate-600">Available consultation slots today 14:00 - 17:00</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name &amp; ID</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin (ID: CS2024-8891)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Topic</label>
                <textarea
                  rows={3}
                  placeholder="e.g. IoT capstone project evaluation or syllabus consultation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setScheduleModalLecturer(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(`Consultation request submitted to ${scheduleModalLecturer.name}!`);
                  setScheduleModalLecturer(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Map Modal */}
      {mapModalLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">map</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Campus Room Map
                  </h4>
                  <p className="text-xs text-slate-500">
                    {mapModalLecturer.name} • Room {mapModalLecturer.room}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMapModalLecturer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Campus Floor Plan Layout */}
            <div className="p-4 rounded-xl bg-slate-900 text-cyan-200 font-mono text-xs border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                <span>CAMPUS WING: ENGINEERING LEVEL 4</span>
                <span className="text-emerald-400">NODE ESP32-{mapModalLecturer.room}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center py-4">
                <div className="p-3 rounded border border-slate-700 bg-slate-800/60 text-slate-400">
                  Room 400<br />Robotics Lab
                </div>
                <div className="p-3 rounded border-2 border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  ROOM {mapModalLecturer.room}<br />
                  <span className="text-[10px] text-white">TARGET OFFICE</span>
                </div>
                <div className="p-3 rounded border border-slate-700 bg-slate-800/60 text-slate-400">
                  Room 404<br />Seminar Hall
                </div>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Elevator Core West • Corridor Door Sensor Active</span>
                <span className="text-cyan-400 font-semibold">2nd Door on Right</span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setMapModalLecturer(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notice Modal */}
      {noticeModalLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Send Door Memo / Notice
                  </h4>
                  <p className="text-xs text-slate-500">
                    Direct dispatch to {noticeModalLecturer.name} (Room {noticeModalLecturer.room})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNoticeModalLecturer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Student name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Waiting outside Room 402 for IoT sensor checkout"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoticeModalLecturer(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(`Notice dispatched to ${noticeModalLecturer.name}'s corridor panel!`);
                  setNoticeModalLecturer(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Send Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
