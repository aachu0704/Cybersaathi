import React, { useState, useMemo } from 'react';
import { Lecturer, LecturerStatus } from '../types/database';
import { StatusBadge } from './ui/StatusBadge';
import { AvatarInitial } from './ui/AvatarInitial';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowLeft,
  Users,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Download,
  RefreshCw,
  Search,
  Radio,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  lecturers: Lecturer[];
  onAddLecturer: (name: string, room: string, status?: LecturerStatus) => Promise<Lecturer>;
  onUpdateLecturer: (id: string, updates: Partial<Pick<Lecturer, 'name' | 'room' | 'status'>>) => Promise<void>;
  onDeleteLecturer: (id: string) => Promise<void>;
  onResetSeeds: () => Promise<void>;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lecturers,
  onAddLecturer,
  onUpdateLecturer,
  onDeleteLecturer,
  onResetSeeds,
  onBack,
}) => {
  // Modal State for Adding
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newStatus, setNewStatus] = useState<LecturerStatus>('Available');
  const [isAdding, setIsAdding] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editStatus, setEditStatus] = useState<LecturerStatus>('Available');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deleteCandidate, setDeleteCandidate] = useState<Lecturer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Dataset Confirmation Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Deterministic helper for mock MAC / ping based on ID / room
  const getTerminalInfo = (id: string, room: string) => {
    const hex = id.replace(/[^a-fA-F0-9]/g, '').slice(0, 8).toUpperCase() || '246F28AB';
    const mac = `24:6F:${hex.slice(0, 2)}:${hex.slice(2, 4)}:${hex.slice(4, 6)}:${hex.slice(6, 8)}`;
    const ping = (parseInt(hex.slice(0, 2), 16) % 15) + 18;
    return { mac, ping };
  };

  const getDepartment = (name: string, room: string) => {
    if (room.startsWith('C') || name.includes('Ravi') || name.includes('Anita')) return 'Computer Science';
    if (room.startsWith('B') || name.includes('Arjun') || name.includes('Vikram')) return 'Robotics & AI';
    if (room.startsWith('A') || name.includes('Priya')) return 'Electrical Eng';
    return 'Data Science';
  };

  const getEmail = (name: string) => {
    const clean = name.toLowerCase().replace(/^(dr\.|prof\.|assoc\.\s*prof\.)\s+/i, '').trim().replace(/\s+/g, '.');
    return `${clean}@faculty.iot`;
  };

  // Handle Add Lecturer
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Lecturer name is required');
      return;
    }

    try {
      setIsAdding(true);
      const added = await onAddLecturer(newName, newRoom, newStatus);
      toast.success(`Added "${added.name}" successfully!`, {
        description: `Assigned to Room ${added.room} with live status ${added.status}.`,
      });
      setNewName('');
      setNewRoom('');
      setNewStatus('Available');
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to add lecturer', {
        description: err?.message || 'Please check your connection.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Start Inline Editing
  const startEditing = (lec: Lecturer) => {
    setEditingId(lec.id);
    setEditName(lec.name);
    setEditRoom(lec.room);
    setEditStatus(lec.status);
  };

  // Cancel Inline Editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditRoom('');
  };

  // Save Inline Edit
  const saveInlineEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Lecturer name cannot be empty');
      return;
    }

    try {
      setIsSavingEdit(true);
      await onUpdateLecturer(id, {
        name: editName.trim(),
        room: editRoom.trim() || 'TBD',
        status: editStatus,
      });
      toast.success(`Updated "${editName}" successfully!`);
      setEditingId(null);
    } catch (err: any) {
      toast.error('Failed to update lecturer', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      setIsDeleting(true);
      await onDeleteLecturer(deleteCandidate.id);
      toast.success(`Deleted "${deleteCandidate.name}" from database.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      toast.error('Failed to delete lecturer', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset to default seed dataset
  const handleResetSeeds = async () => {
    try {
      await onResetSeeds();
      toast.success('Faculty directory reset to 7 default seeds!');
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      toast.error('Failed to reset dataset', {
        description: err?.message || 'Please try again.',
      });
    }
  };

  // Bulk Sync Simulation
  const handleBulkSync = () => {
    toast.success(`Synchronized ${lecturers.length} corridor display nodes instantaneously.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Room', 'Department', 'Status'];
    const rows = lecturers.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.room}"`,
      `"${getDepartment(l.name, l.room)}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faculty_availability_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Faculty registry exported as CSV!');
  };

  // Filtered rows
  const filteredLecturers = useMemo(() => {
    return lecturers.filter((l) => {
      const q = searchQuery.toLowerCase();
      const terminal = getTerminalInfo(l.id, l.room);
      const dept = getDepartment(l.name, l.room);
      const matchesQuery =
        l.name.toLowerCase().includes(q) ||
        l.room.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        terminal.mac.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'all' || dept === selectedDept;

      return matchesQuery && matchesDept;
    });
  }, [lecturers, searchQuery, selectedDept]);

  return (
    <div className="w-full space-y-8 animate-fadeIn font-sans">
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Administrative Faculty Registry &amp; Hardware Management
        </span>
      </div>

      {/* Page Title & Top Actions (Snitch Design) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Administrative Management
            </span>
            <span className="text-xs text-slate-500">• Central Terminal Mesh</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Faculty Directory Management
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              (Faculty Registry &amp; Hardware Administration)
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Manage lecturer profiles, corridor display pairings, department assignments, and system telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleBulkSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">sync</span>
            Sync All Displays
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
            Export Data (CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(!isAddModalOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Add New Faculty Member
          </button>
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
            title="Reset to 7 seeded lecturers"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Add New Faculty Member Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Faculty Member</h3>
              <p className="text-xs text-slate-500">Assign name, office room, and default availability.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office Room</label>
            <input
              type="text"
              placeholder="e.g. C204"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as LecturerStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAdding ? 'Adding...' : 'Add Faculty'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4 KPI Cards (Academic Clean Style from Snitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Registered</span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-700 material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{lecturers.length}</span>
            <span className="text-sm font-medium text-slate-600">Faculty Accounts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            100% verified credentials
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">ESP32 Nodes Online</span>
            <span className="p-2 rounded-lg bg-slate-100 text-blue-600 material-symbols-outlined text-[20px]">router</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{lecturers.length} / {lecturers.length}</span>
            <span className="text-sm font-medium text-emerald-600">Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Corridor e-Paper Panels bound
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Status Updates Today</span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-700 material-symbols-outlined text-[20px]">swap_horiz</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">48</span>
            <span className="text-sm font-medium text-slate-600">Transitions</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-[15px] text-blue-600">trending_up</span>
            +14% vs yesterday morning
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">System Uptime</span>
            <span className="p-2 rounded-lg bg-slate-100 text-emerald-700 material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">99.98%</span>
            <span className="text-xs font-medium text-slate-500">(Supabase Realtime)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Latency: 28ms avg</span>
            <span className="font-medium text-emerald-700">SSL Valid</span>
          </div>
        </div>
      </div>

      {/* Faculty Management Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search faculty, office, or MAC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="deptDropdown" className="text-xs font-semibold text-slate-600 shrink-0">
                Department:
              </label>
              <select
                id="deptDropdown"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Departments ({lecturers.length})</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Robotics & AI">Robotics &amp; AI</option>
                <option value="Electrical Eng">Electrical Eng</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Broadcast Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Auto-sync: 3000ms</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Office / Room</th>
                <th className="py-3 px-4">Paired ESP32 Terminal</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLecturers.map((lec) => {
                const isEditing = editingId === lec.id;
                const dept = getDepartment(lec.name, lec.room);
                const email = getEmail(lec.name);
                const terminal = getTerminalInfo(lec.id, lec.room);

                return (
                  <tr key={lec.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Faculty Member */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-blue-400 rounded-md text-sm font-semibold w-full focus:outline-none"
                          placeholder="Faculty Name"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <AvatarInitial name={lec.name} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">{lec.name}</div>
                            <div className="text-xs text-slate-500">{email}</div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {dept}
                      </span>
                    </td>

                    {/* Office / Room */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRoom}
                          onChange={(e) => setEditRoom(e.target.value)}
                          className="px-2 py-1 border border-blue-400 rounded-md text-sm w-24 focus:outline-none"
                          placeholder="Room"
                        />
                      ) : (
                        <div>
                          <span className="font-medium text-slate-900">Room {lec.room}</span>
                          <span className="text-xs text-slate-500 block">(Main Tower)</span>
                        </div>
                      )}
                    </td>

                    {/* Paired ESP32 Terminal */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {terminal.mac}
                        </span>
                        <span className="text-xs text-slate-500">ESP32-S3 • Ping {terminal.ping}ms</span>
                      </div>
                    </td>

                    {/* Live Status */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as LecturerStatus)}
                          className="rounded-md border border-blue-400 bg-white text-xs font-semibold py-1 px-2 focus:outline-none cursor-pointer"
                        >
                          <option value="Available">Available</option>
                          <option value="Busy">Busy</option>
                          <option value="Not Available">Not Available</option>
                        </select>
                      ) : (
                        <select
                          value={lec.status}
                          onChange={async (e) => {
                            const newSt = e.target.value as LecturerStatus;
                            await onUpdateLecturer(lec.id, { status: newSt });
                            toast.success(`Updated ${lec.name} to ${newSt}!`);
                          }}
                          className={`rounded-md border font-semibold text-xs py-1 px-2.5 focus:outline-none cursor-pointer ${
                            lec.status === 'Available'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : lec.status === 'Busy'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-rose-200 bg-rose-50 text-rose-800'
                          }`}
                        >
                          <option value="Available">● Available</option>
                          <option value="Busy">● Busy / Meeting</option>
                          <option value="Not Available">● Not Available</option>
                        </select>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={isSavingEdit}
                            onClick={() => saveInlineEdit(lec.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditing(lec)}
                            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Faculty"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => toast.success(`Node ${terminal.mac} refreshed for ${lec.name}.`)}
                            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Sync Display Node"
                          >
                            <span className="material-symbols-outlined text-[18px]">sync</span>
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(lec)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Faculty Member Modal / Card */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Faculty Member</h3>
                  <p className="text-xs text-slate-500">Assign name, office room, and default availability.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Office Room</label>
                  <input
                    type="text"
                    placeholder="e.g. C204"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LecturerStatus)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAdding ? 'Adding...' : 'Add Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Confirm Faculty Removal</h4>
                <p className="text-xs text-slate-500">Remove from central database and unbind terminal node.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{deleteCandidate.name}</p>
              <p className="text-slate-500">Office Room: {deleteCandidate.room} • Status: {deleteCandidate.status}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Seeds Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Reset Default Seeds</h4>
                <p className="text-xs text-slate-500">Restore the original 7 faculty members in the database.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will overwrite custom additions and reset all lecturers to the default 7 campus seed records.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSeeds}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
