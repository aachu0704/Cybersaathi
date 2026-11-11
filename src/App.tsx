import React, { useState } from 'react';
import { useLecturers } from './hooks/useLecturers';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { LecturerDashboard } from './components/LecturerDashboard';
import { StudentView } from './components/StudentView';
import { IotDisplay } from './components/IotDisplay';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

export type AppView = 'role-selector' | 'lecturer' | 'student' | 'iot' | 'admin';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('role-selector');
  const {
    lecturers,
    isLoading,
    error,
    isRealtimeActive,
    updateStatus,
    addLecturer,
    updateLecturer,
    deleteLecturer,
    resetToSeeds,
  } = useLecturers();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Toast notifications container */}
      <Toaster position="top-right" richColors closeButton />

      {/* Main Academic Top Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        isRealtimeActive={isRealtimeActive}
        lecturers={lecturers}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading && lecturers.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">
              Loading faculty directory and synchronizing realtime...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'role-selector' && (
              <RoleSelector
                onSelectRole={setCurrentView}
                lecturers={lecturers}
              />
            )}

            {currentView === 'lecturer' && (
              <LecturerDashboard
                lecturers={lecturers}
                onUpdateStatus={updateStatus}
                onBack={() => setCurrentView('role-selector')}
              />
            )}

            {currentView === 'student' && (
              <StudentView
                lecturers={lecturers}
                onBack={() => setCurrentView('role-selector')}
                isRealtimeActive={isRealtimeActive}
              />
            )}

            {currentView === 'iot' && (
              <IotDisplay
                lecturers={lecturers}
                onBack={() => setCurrentView('role-selector')}
                isRealtimeActive={isRealtimeActive}
              />
            )}

            {currentView === 'admin' && (
              <AdminPanel
                lecturers={lecturers}
                onAddLecturer={addLecturer}
                onUpdateLecturer={updateLecturer}
                onDeleteLecturer={deleteLecturer}
                onResetSeeds={resetToSeeds}
                onBack={() => setCurrentView('role-selector')}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Academic Footer */}
      <footer className="w-full bg-white border-t border-[#E2E8F0] py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700">SmartFaculty IoT</span>
            <span className="text-slate-300">|</span>
            <span>Campus Real-Time Hardware Architecture • ESP32 &amp; Supabase Integration</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Gateway Hub #West-400 Active
            </span>
            <span className="text-slate-300">|</span>
            <span>Version 2.4.0-Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
