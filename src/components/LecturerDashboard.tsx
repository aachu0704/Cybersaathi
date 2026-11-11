import React, { useState, useEffect, useRef } from 'react';
import { Lecturer, LecturerStatus } from '../types/database';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Sparkles, RefreshCw, Radio, Bolt, Monitor, Wifi, Cpu, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface LecturerDashboardProps {
  lecturers: Lecturer[];
  onUpdateStatus: (id: string, status: LecturerStatus) => Promise<void>;
  onBack: () => void;
}

interface ActivityLogItem {
  id: string;
  timestamp: string;
  lecturerName: string;
  room: string;
  origin: string;
  fromStatus: string;
  toStatus: string;
  latency: number;
  ackId: number;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  lecturers,
  onUpdateStatus,
  onBack,
}) => {
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(() => {
    return lecturers[0]?.id || '';
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [customNotice, setCustomNotice] = useState<string>('Office hours consultation • Door terminal active');
  const [activeMarquee, setActiveMarquee] = useState<string>('Office hours consultation • Door terminal active • Verified Terminal Sync');
  const [latency, setLatency] = useState<number>(28);
  const [isLedFlashing, setIsLedFlashing] = useState<boolean>(false);
  const [isScreenFlickering, setIsScreenFlickering] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(6139);
  const [clockTime, setClockTime] = useState<Date>(new Date());

  const currentLecturer = lecturers.find((l) => l.id === selectedLecturerId) || lecturers[0];

  // Activity Log State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 45000).toTimeString().split(' ')[0] + '.118',
      lecturerName: 'Dr. Ravi Kumar',
      room: 'C204',
      origin: 'Web Dashboard (Lecturer Control)',
      fromStatus: 'BUSY',
      toStatus: 'AVAILABLE',
      latency: 28,
      ackId: 7701,
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 180000).toTimeString().split(' ')[0] + '.902',
      lecturerName: 'Dr. Meena Sharma',
      room: 'C210',
      origin: 'NFC Door Terminal',
      fromStatus: 'NOT AVAILABLE',
      toStatus: 'BUSY',
      latency: 19,
      ackId: 7700,
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 600000).toTimeString().split(' ')[0] + '.410',
      lecturerName: 'Prof. Arjun Patel',
      room: 'B301',
      origin: 'Academic Calendar Auto-Sync',
      fromStatus: 'AVAILABLE',
      toStatus: 'NOT AVAILABLE',
      latency: 32,
      ackId: 7699,
    },
  ]);

  // Sync selection when lecturers list changes
  useEffect(() => {
    if (!selectedLecturerId && lecturers.length > 0) {
      setSelectedLecturerId(lecturers[0].id);
    }
  }, [lecturers, selectedLecturerId]);

  // Session timer & Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
      setClockTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerLedBlink = () => {
    setIsLedFlashing(true);
    setTimeout(() => setIsLedFlashing(false), 150);
  };

  const formatSessionTime = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleStatusChange = async (newStatus: LecturerStatus) => {
    if (!currentLecturer) return;
    if (currentLecturer.status === newStatus) {
      toast.info(`Status is already "${newStatus}"`);
      return;
    }

    const previousStatus = currentLecturer.status;
    const computedLatency = Math.floor(Math.random() * 18) + 18;
    setLatency(computedLatency);
    triggerLedBlink();

    try {
      setIsUpdating(true);
      await onUpdateStatus(currentLecturer.id, newStatus);

      // Append to live transaction activity logs
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const newLog: ActivityLogItem = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        lecturerName: currentLecturer.name,
        room: currentLecturer.room,
        origin: 'Web Dashboard (Lecturer Control)',
        fromStatus: previousStatus.toUpperCase(),
        toStatus: newStatus.toUpperCase(),
        latency: computedLatency,
        ackId: Math.floor(Math.random() * 2000) + 7000,
      };
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      toast.success(`${currentLecturer.name} is now ${newStatus}!`, {
        description: `Corridor node Room ${currentLecturer.room} synchronized (${computedLatency}ms).`,
      });
    } catch (err: any) {
      toast.error('Failed to update status', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNoticeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customNotice.trim() || 'Ready for office hours consultation';
    setActiveMarquee(`${text} • Verified Terminal Sync • Room ${currentLecturer?.room || '402'} Active`);
    triggerLedBlink();
    toast.success('Corridor door marquee ticker updated!');
  };

  const handleSimulateRefresh = () => {
    triggerLedBlink();
    setIsScreenFlickering(true);
    setTimeout(() => {
      setIsScreenFlickering(false);
      setLatency(Math.floor(Math.random() * 12) + 18);
      toast.info('Corridor node screen refreshed.');
    }, 250);
  };

  const handlePingNode = () => {
    triggerLedBlink();
    const newLat = Math.floor(Math.random() * 10) + 16;
    setLatency(newLat);
    toast.info(`Pinged corridor terminal: ${newLat}ms RTT acknowledgment.`);
  };

  const statusConfig = {
    Available: {
      headline: 'Available • In Office & Open',
      sub: 'Walk-ins welcome for architectural office hours',
      colorClass: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-700',
      icon: 'check_circle',
      badgeBorder: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-950/30',
      badgeText: 'text-emerald-400',
      badgeSubText: 'text-emerald-300',
      screenTitle: '[ AVAILABLE ]',
      screenSub: 'PLEASE KNOCK & ENTER',
      activeBorder: 'border-emerald-600 bg-emerald-50/70',
      checkColor: 'text-emerald-600',
    },
    Busy: {
      headline: 'Busy • Do Not Disturb',
      sub: 'Conducting project evaluation or remote conference',
      colorClass: 'text-amber-700',
      iconBg: 'bg-amber-100 text-amber-700',
      icon: 'pending',
      badgeBorder: 'border-amber-500/40',
      badgeBg: 'bg-amber-950/30',
      badgeText: 'text-amber-400',
      badgeSubText: 'text-amber-300',
      screenTitle: '[ BUSY / IN MEETING ]',
      screenSub: 'DO NOT DISTURB',
      activeBorder: 'border-amber-600 bg-amber-50/70',
      checkColor: 'text-amber-600',
    },
    'Not Available': {
      headline: 'Not Available • Away / In Lecture',
      sub: 'Faculty member not currently available at office',
      colorClass: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-700',
      icon: 'do_not_disturb_on',
      badgeBorder: 'border-rose-500/40',
      badgeBg: 'bg-rose-950/30',
      badgeText: 'text-rose-400',
      badgeSubText: 'text-rose-300',
      screenTitle: '[ NOT AVAILABLE ]',
      screenSub: 'PLEASE SEND AN EMAIL',
      activeBorder: 'border-rose-600 bg-rose-50/70',
      checkColor: 'text-rose-600',
    },
  };

  const currentStatus = (currentLecturer?.status || 'Available') as LecturerStatus;
  const cfg = statusConfig[currentStatus] || statusConfig.Available;

  return (
    <div className="w-full space-y-8 animate-fadeIn font-sans">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Department Corridor Presence Control Center
        </span>
      </div>

      {/* Page Header (Prominent & Simple) */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Lecturer Control Center
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-3xl">
              Select your profile and update your live office presence. Changes synchronize instantaneously with your corridor hardware terminal.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Node Sync Latency</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>{latency}</span> ms
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200"></div>
              <button
                onClick={handlePingNode}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                Ping Node
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Control Card & Hardware Terminal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Lecturer Selection & 1-Tap Status Switcher */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 sm:p-7">
            {/* Faculty Profile Selection */}
            <div className="mb-6">
              <label
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                htmlFor="lecturer-select"
              >
                Faculty Profile Selection
              </label>
              <div className="relative">
                <select
                  id="lecturer-select"
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] text-slate-900 font-semibold text-sm rounded-lg px-4 py-2.5 pr-10 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors cursor-pointer"
                >
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} — Room {lec.room} ({lec.status})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Current Broadcast Status Banner */}
            <div className="mb-6 p-4 rounded-xl border bg-slate-50 border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                  <span className="material-symbols-outlined text-[24px]">{cfg.icon}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Current Broadcast Status
                  </span>
                  <span className={`text-base font-bold ${cfg.colorClass}`}>
                    {cfg.headline}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {cfg.sub}
                  </span>
                </div>
              </div>
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Broadcasting Since</span>
                <span className="text-sm font-mono font-semibold text-slate-700">
                  {formatSessionTime(sessionSeconds)}
                </span>
              </div>
            </div>

            {/* Update Status Section (Three Clean Distinction Buttons) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Availability Status</span>
                <span className="text-xs text-slate-400">Immediate corridor push</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* AVAILABLE BUTTON */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('Available')}
                  className={`group text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between h-32 cursor-pointer shadow-xs ${
                    currentStatus === 'Available'
                      ? 'bg-emerald-50/70 border-emerald-600'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-3 h-3 rounded-full bg-emerald-500 ring-4 ${currentStatus === 'Available' ? 'ring-emerald-100' : 'ring-transparent'}`}></span>
                    {currentStatus === 'Available' && (
                      <span className="text-emerald-600 font-bold material-symbols-outlined text-[20px]">check</span>
                    )}
                  </div>
                  <div>
                    <h4 className="block text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Available</h4>
                    <span className="block text-xs text-slate-500 mt-0.5">In Office &amp; Available</span>
                  </div>
                </button>

                {/* BUSY BUTTON */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('Busy')}
                  className={`group text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between h-32 cursor-pointer shadow-xs ${
                    currentStatus === 'Busy'
                      ? 'bg-amber-50/70 border-amber-600'
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-3 h-3 rounded-full bg-amber-500 ring-4 ${currentStatus === 'Busy' ? 'ring-amber-100' : 'ring-transparent'}`}></span>
                    {currentStatus === 'Busy' && (
                      <span className="text-amber-600 font-bold material-symbols-outlined text-[20px]">check</span>
                    )}
                  </div>
                  <div>
                    <h4 className="block text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Busy</h4>
                    <span className="block text-xs text-slate-500 mt-0.5">Do Not Disturb / Meeting</span>
                  </div>
                </button>

                {/* NOT AVAILABLE BUTTON */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('Not Available')}
                  className={`group text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between h-32 cursor-pointer shadow-xs ${
                    currentStatus === 'Not Available'
                      ? 'bg-rose-50/70 border-rose-600'
                      : 'bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-3 h-3 rounded-full bg-rose-500 ring-4 ${currentStatus === 'Not Available' ? 'ring-rose-100' : 'ring-transparent'}`}></span>
                    {currentStatus === 'Not Available' && (
                      <span className="text-rose-600 font-bold material-symbols-outlined text-[20px]">check</span>
                    )}
                  </div>
                  <div>
                    <h4 className="block text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">Not Available</h4>
                    <span className="block text-xs text-slate-500 mt-0.5">In Lecture / Away</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Corridor Marquee Note Input */}
            <div className="pt-4 border-t border-[#E2E8F0]">
              <form onSubmit={handleNoticeUpdate}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="custom-note-input">
                    Door Display Subtitle / Notice
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    {customNotice.length} / 90
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="custom-note-input"
                    maxLength={90}
                    value={customNotice}
                    onChange={(e) => setCustomNotice(e.target.value)}
                    placeholder="e.g. Back at 3:30 PM, consultation in Lab 2"
                    className="flex-1 bg-white border border-[#E2E8F0] text-slate-900 px-3.5 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
                    type="text"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    Update Display
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Academic Schedule Snippet */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Synchronized Office Hours Matrix</h3>
                <p className="text-xs text-slate-500">Automatic calendar schedule sync with campus SIS</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-mono block text-[11px]">09:00 - 11:30</span>
                <span className="font-semibold text-slate-800 block mt-1">Research Prep</span>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">BUSY</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-mono block text-[11px]">11:30 - 14:00</span>
                <span className="font-semibold text-slate-800 block mt-1">Lecture Hall</span>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">LECTURE</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 font-mono block text-[11px]">14:00 - 17:00</span>
                <span className="font-bold text-emerald-900 block mt-1">Open Hours</span>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">ACTIVE</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-mono block text-[11px]">17:00 - 19:00</span>
                <span className="font-semibold text-slate-800 block mt-1">Lab Review</span>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">TRANSIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IoT ESP32 Corridor Terminal Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700 text-[20px]">monitor</span>
                <h2 className="text-sm font-bold text-slate-900">Corridor Terminal Preview</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                ESP32-OLED-{currentLecturer?.room || '402'}
              </span>
            </div>

            {/* Realistic Hardware Chassis (Dark Matte Gray Frame) */}
            <div className="rounded-xl bg-[#1E2530] p-4 border-4 border-[#0F141C] shadow-lg relative">
              {/* Screw Mount Emulations */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-600"></div>

              {/* Header Hardware Bezel info */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 pb-2 mb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>HW-REV4 • CORR-{currentLecturer?.room || '402'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isLedFlashing ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-emerald-400'}`}></span>
                  <span>MESH SYNC</span>
                </div>
              </div>

              {/* E-Paper / Monochromatic OLED Door Display */}
              <div className={`rounded-lg bg-[#0A0E17] p-5 font-mono text-slate-100 border border-slate-800 flex flex-col justify-between min-h-[280px] transition-opacity duration-200 ${isScreenFlickering ? 'opacity-50' : 'opacity-100'}`}>
                {/* Room Header Line */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-bold tracking-wider text-slate-200">
                    <span>ROOM {currentLecturer?.room || '402'}</span>
                    <span className="text-slate-600">|</span>
                    <span className="uppercase">{currentLecturer?.name || 'FACULTY'}</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {clockTime.toTimeString().split(' ')[0]}
                  </span>
                </div>

                {/* Primary Status Display Block */}
                <div className="py-6 text-center flex flex-col items-center justify-center">
                  <div className={`w-full py-4 px-3 rounded border ${cfg.badgeBorder} ${cfg.badgeBg} ${cfg.badgeText} flex flex-col items-center justify-center transition-all duration-300`}>
                    <span className="text-xl sm:text-2xl font-black tracking-widest uppercase">
                      {cfg.screenTitle}
                    </span>
                    <span className={`text-xs tracking-wider uppercase mt-1 ${cfg.badgeSubText} font-medium`}>
                      {cfg.screenSub}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 tracking-wider uppercase mt-3">
                    Faculty of Distributed Computing
                  </span>
                </div>

                {/* Bottom Marquee Ticker */}
                <div className="bg-black/50 border border-slate-800/80 rounded px-2.5 py-1.5 text-xs text-cyan-300 overflow-hidden">
                  <div className="w-full overflow-hidden whitespace-nowrap">
                    <p className="animate-marquee inline-block font-mono text-[11px]">
                      {activeMarquee}
                    </p>
                  </div>
                </div>
              </div>

              {/* Frame Bottom Status Telemetry */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-3 px-1">
                <span>MAC: 48:E7:29:A1:B8:90</span>
                <span className="text-emerald-400">WIFI: -54 dBm (92%)</span>
                <span>PWR: MAINS (5.0V)</span>
              </div>
            </div>

            {/* Realistic Hardware Telemetry Details */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E2E8F0] text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wi-Fi RSSI</span>
                <span className="font-mono font-semibold text-slate-700">-54 dBm</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Power Source</span>
                <span className="font-mono font-semibold text-slate-700">Mains 5V</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Refresh Latency</span>
                <span className="font-mono font-semibold text-emerald-700">{latency} ms</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Firmware</span>
                <span className="font-mono font-semibold text-slate-700">v3.14.9</span>
              </div>
            </div>

            {/* Hardware Action Buttons */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={handleSimulateRefresh}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Simulate Refresh
              </button>
              <button
                onClick={handlePingNode}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">wifi_tethering</span>
                Ping Node
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry & Broadcast Transaction Log Table (Clean White Card) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Broadcast Activity Log</h3>
            <p className="text-xs text-slate-500">Live audit ledger of lecturer presence updates and edge corridor terminal acknowledgments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActivityLogs([]);
                toast.info('Local log cache cleared.');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear Local Cache
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Realtime Stream Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-4 font-mono">Timestamp</th>
                <th className="py-2.5 px-4">Lecturer &amp; Room</th>
                <th className="py-2.5 px-4">Origin Channel</th>
                <th className="py-2.5 px-4">Status Shift</th>
                <th className="py-2.5 px-4 font-mono">Payload Latency</th>
                <th className="py-2.5 px-4">ESP32 Sync Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.lecturerName} (Room {log.room})
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.origin}</td>
                    <td className="py-3 px-4 font-medium">
                      <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
                        {log.fromStatus}
                      </span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                        log.toStatus === 'AVAILABLE'
                          ? 'text-emerald-700 bg-emerald-50'
                          : log.toStatus === 'BUSY'
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}>
                        {log.toStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{log.latency}ms</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ACK_SUPABASE_OK #{log.ackId}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-slate-400 italic">
                    Local cache cleared. Ready for next incoming dispatch acknowledgment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
