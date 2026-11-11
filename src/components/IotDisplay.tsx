import React, { useState, useEffect } from 'react';
import { Lecturer, LecturerStatus } from '../types/database';
import { ArrowLeft, Wifi, Cpu, Activity, Clock, Terminal, Monitor, RefreshCw } from 'lucide-react';

interface IotDisplayProps {
  lecturers: Lecturer[];
  onBack: () => void;
  isRealtimeActive: boolean;
}

export const IotDisplay: React.FC<IotDisplayProps> = ({
  lecturers,
  onBack,
  isRealtimeActive,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [displayMode, setDisplayMode] = useState<'grid' | 'ticker'>('grid');
  const [activeTickerIndex, setActiveTickerIndex] = useState<number>(0);

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto ticker cycle
  useEffect(() => {
    if (displayMode !== 'ticker' || lecturers.length === 0) return;
    const interval = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % lecturers.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayMode, lecturers.length]);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusDetails = (status: LecturerStatus) => {
    switch (status) {
      case 'Available':
        return {
          label: 'AVAILABLE',
          color: 'text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_#10b981]',
          border: 'border-emerald-500/30',
          glowText: 'iot-glow-green',
        };
      case 'Busy':
        return {
          label: 'BUSY',
          color: 'text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24,0_0_24px_#f59e0b]',
          border: 'border-amber-500/30',
          glowText: 'iot-glow-yellow',
        };
      case 'Not Available':
        return {
          label: 'NOT AVAILABLE',
          color: 'text-rose-400',
          dot: 'bg-rose-500 shadow-[0_0_12px_#f87171,0_0_24px_#ef4444]',
          border: 'border-rose-500/30',
          glowText: 'iot-glow-red',
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'text-slate-400',
          dot: 'bg-slate-400',
          border: 'border-slate-700',
          glowText: '',
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn font-mono">
      {/* Top Controls Navigation */}
      <div className="flex items-center justify-between font-sans">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Display Mode:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Grid
            </button>
            <button
              onClick={() => setDisplayMode('ticker')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                displayMode === 'ticker'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auto Ticker
            </button>
          </div>
        </div>
      </div>

      {/* ESP32 Physical Hardware Bezel Shell */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-black p-4 sm:p-7 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-600/50">
        {/* Hardware Screws at 4 corners */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-500 border border-slate-400/50 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-700 rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-500 border border-slate-400/50 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-700 -rotate-45" />
        </div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-500 border border-slate-400/50 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-700 -rotate-12" />
        </div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-500 border border-slate-400/50 flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-slate-700 rotate-45" />
        </div>

        {/* Hardware Header Label */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-widest mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-cyan-400 tracking-wider">ESP32-S3</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">SMART SIGNAGE PANEL V2.4</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="text-[10px] text-cyan-300">PWR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-[10px] text-emerald-300">WIFI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] text-amber-300">SYNC</span>
            </div>
          </div>
        </div>

        {/* Inner OLED/LCD Screen with Scanline & CRT Effect */}
        <div className="relative rounded-2xl bg-[#060b19] border-2 border-cyan-900/60 p-5 sm:p-7 text-cyan-100 iot-scanlines shadow-inner min-h-[460px] flex flex-col justify-between overflow-hidden">
          {/* Top Status & Digital Clock Bar */}
          <div className="relative z-30 border-b border-cyan-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
                <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="iot-glow-cyan">CAMPUS FACULTY AVAILABILITY TERMINAL</span>
              </div>
              <p className="text-[11px] text-cyan-600 mt-0.5 tracking-wide">
                STATION NODE: WEST-WING-HALL-2 • REFRESH: REALTIME PUSH
              </p>
            </div>

            {/* Glowing Live Digital Clock */}
            <div className="text-right sm:text-right bg-cyan-950/60 border border-cyan-700/50 rounded-xl px-4 py-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="text-xl sm:text-2xl font-black tracking-wider text-cyan-300 iot-glow-cyan">
                {formatTime(currentTime)}
              </div>
              <div className="text-[10px] tracking-wider text-cyan-500 font-semibold uppercase">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Main Display Area */}
          <div className="relative z-30 my-6 flex-1">
            {displayMode === 'grid' ? (
              /* Grid of Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {lecturers.map((lec) => {
                  const statusInfo = getStatusDetails(lec.status);
                  return (
                    <div
                      key={lec.id}
                      className={`p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border ${statusInfo.border} hover:bg-slate-800/80 transition-all flex items-center justify-between gap-3 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Glowing Status Dot */}
                        <div className="relative flex items-center justify-center">
                          <span className={`w-3.5 h-3.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                            {lec.name}
                          </div>
                          <div className="text-xs text-cyan-400/80 flex items-center gap-2 mt-0.5">
                            <span>ROOM: {lec.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Text with glow */}
                      <div className="text-right">
                        <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${statusInfo.color} ${statusInfo.glowText}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Auto-Cycling Ticker Carousel */
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center p-6 bg-slate-900/80 border border-cyan-800/40 rounded-2xl relative">
                {lecturers.length > 0 && (() => {
                  const activeLec = lecturers[activeTickerIndex] || lecturers[0];
                  const statusInfo = getStatusDetails(activeLec.status);
                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-700/60 bg-cyan-950/80 text-[11px] text-cyan-300">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>TICKER ENTRY {activeTickerIndex + 1} OF {lecturers.length}</span>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <span className={`w-5 h-5 rounded-full ${statusInfo.dot} animate-pulse`} />
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                          {activeLec.name}
                        </h3>
                      </div>

                      <div className="text-lg sm:text-xl text-cyan-300 font-semibold tracking-wide">
                        OFFICE: <span className="text-white font-bold">{activeLec.room}</span>
                      </div>

                      <div className={`text-xl sm:text-3xl font-black uppercase tracking-widest ${statusInfo.color} ${statusInfo.glowText} pt-2`}>
                        {activeLec.name} — {activeLec.status} ({activeLec.room})
                      </div>
                    </div>
                  );
                })()}

                {/* Progress ticker dots */}
                <div className="absolute bottom-3 flex items-center gap-1.5">
                  {lecturers.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTickerIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeTickerIndex ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Hardware Telemetry Bar */}
          <div className="relative z-30 pt-3 border-t border-cyan-900/60 flex flex-wrap items-center justify-between text-[10px] sm:text-xs text-cyan-500 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>XTENSA LX7 @ 240MHz</span>
              </span>
              <span className="hidden sm:inline text-cyan-800">|</span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>802.11 b/g/n (-38 dBm)</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-semibold">
                POSTGRES REALTIME: {isRealtimeActive ? 'CONNECTED' : 'LOCAL BUS'}
              </span>
              <span className="text-cyan-600">RAM: 312KB FREE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description below IoT panel */}
      <div className="text-center text-xs text-slate-500 font-sans">
        Simulated ESP32 IoT Physical Signage Node running FreeRTOS display driver with Supabase Realtime WebSocket client.
      </div>
    </div>
  );
};
