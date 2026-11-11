import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, getLocalLecturers, saveLocalLecturers } from '../lib/supabase';
import { Lecturer, LecturerStatus, INITIAL_LECTURERS } from '../types/database';

export function useLecturers() {
  const [lecturers, setLecturers] = useState<Lecturer[]>(() => {
    const local = getLocalLecturers();
    return [...local].sort((a, b) => a.name.localeCompare(b.name));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Helper to sort lecturers by name
  const sortLecturers = (list: Lecturer[]) => {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Broadcast change across tabs / components
  const broadcastChange = useCallback((action: string, data: any) => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ action, data, timestamp: Date.now() });
      } catch (err) {
        console.warn('BroadcastChannel postMessage error:', err);
      }
    }
  }, []);

  // Fetch initial data
  const fetchLecturers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('lecturers')
          .select('*')
          .order('name', { ascending: true });

        if (fetchErr) {
          console.warn('Supabase fetch error, using local fallback:', fetchErr.message);
          const fallback = getLocalLecturers();
          setLecturers(sortLecturers(fallback));
          setError(fetchErr.message);
        } else if (data && data.length > 0) {
          const sorted = sortLecturers(data as Lecturer[]);
          setLecturers(sorted);
          saveLocalLecturers(sorted);
        } else {
          // Empty remote table, seed with initial lecturers
          for (const item of INITIAL_LECTURERS) {
            await supabase.from('lecturers').upsert({
              id: item.id,
              name: item.name,
              room: item.room,
              status: item.status,
            });
          }
          setLecturers(sortLecturers(INITIAL_LECTURERS));
          saveLocalLecturers(INITIAL_LECTURERS);
        }
      } catch (err: any) {
        console.warn('Error fetching from Supabase:', err);
        const fallback = getLocalLecturers();
        setLecturers(sortLecturers(fallback));
      }
    } else {
      // Use local storage data
      const local = getLocalLecturers();
      setLecturers(sortLecturers(local));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLecturers();

    // Set up BroadcastChannel for multi-tab instantaneous real-time sync
    try {
      const bc = new BroadcastChannel('smart_lecturer_realtime_channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        const { action, data } = event.data || {};
        if (action === 'STATUS_UPDATE') {
          setLecturers((prev) => {
            const next = prev.map((l) => (l.id === data.id ? { ...l, status: data.status, updated_at: new Date().toISOString() } : l));
            saveLocalLecturers(next);
            return sortLecturers(next);
          });
        } else if (action === 'INSERT') {
          setLecturers((prev) => {
            if (prev.some((l) => l.id === data.id)) return prev;
            const next = [...prev, data];
            saveLocalLecturers(next);
            return sortLecturers(next);
          });
        } else if (action === 'UPDATE') {
          setLecturers((prev) => {
            const next = prev.map((l) => (l.id === data.id ? { ...l, ...data, updated_at: new Date().toISOString() } : l));
            saveLocalLecturers(next);
            return sortLecturers(next);
          });
        } else if (action === 'DELETE') {
          setLecturers((prev) => {
            const next = prev.filter((l) => l.id !== data.id);
            saveLocalLecturers(next);
            return next;
          });
        } else if (action === 'SYNC') {
          if (Array.isArray(data)) {
            setLecturers(sortLecturers(data));
            saveLocalLecturers(data);
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }

    // Set up Supabase Realtime subscription on 'lecturers' table
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:lecturers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'lecturers' },
          (payload) => {
            console.log('Realtime postgres_changes received:', payload);
            if (payload.eventType === 'INSERT') {
              const newLecturer = payload.new as Lecturer;
              setLecturers((prev) => {
                if (prev.some((item) => item.id === newLecturer.id)) return prev;
                const next = sortLecturers([...prev, newLecturer]);
                saveLocalLecturers(next);
                return next;
              });
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Lecturer;
              setLecturers((prev) => {
                const next = sortLecturers(
                  prev.map((item) => (item.id === updated.id ? updated : item))
                );
                saveLocalLecturers(next);
                return next;
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setLecturers((prev) => {
                const next = prev.filter((item) => item.id !== deletedId);
                saveLocalLecturers(next);
                return next;
              });
            }
          }
        )
        .subscribe((status) => {
          setIsRealtimeActive(status === 'SUBSCRIBED');
        });
    } else {
      setIsRealtimeActive(true); // Active via reactive local bus
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [fetchLecturers]);

  // 1. Update status
  const updateStatus = async (id: string, status: LecturerStatus) => {
    const updatedAt = new Date().toISOString();
    // Optimistic update
    setLecturers((prev) => {
      const next = sortLecturers(
        prev.map((l) => (l.id === id ? { ...l, status, updated_at: updatedAt } : l))
      );
      saveLocalLecturers(next);
      return next;
    });

    broadcastChange('STATUS_UPDATE', { id, status });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: err } = await supabase
          .from('lecturers')
          .update({ status, updated_at: updatedAt })
          .eq('id', id);
        if (err) throw err;
      } catch (err: any) {
        console.error('Error updating status in Supabase:', err);
      }
    }
  };

  // 2. Add lecturer
  const addLecturer = async (name: string, room: string, status: LecturerStatus = 'Available') => {
    const newLecturer: Lecturer = {
      id: crypto.randomUUID ? crypto.randomUUID() : `lec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      room: (room.trim() || 'TBD'),
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setLecturers((prev) => {
      const next = sortLecturers([...prev, newLecturer]);
      saveLocalLecturers(next);
      return next;
    });

    broadcastChange('INSERT', newLecturer);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: err } = await supabase
          .from('lecturers')
          .insert({
            name: newLecturer.name,
            room: newLecturer.room,
            status: newLecturer.status,
          })
          .select()
          .single();

        if (err) throw err;
        if (data) {
          setLecturers((prev) => {
            const next = sortLecturers(
              prev.map((l) => (l.id === newLecturer.id ? (data as Lecturer) : l))
            );
            saveLocalLecturers(next);
            return next;
          });
        }
      } catch (err: any) {
        console.error('Error adding lecturer to Supabase:', err);
      }
    }

    return newLecturer;
  };

  // 3. Update lecturer details
  const updateLecturer = async (id: string, updates: Partial<Pick<Lecturer, 'name' | 'room' | 'status'>>) => {
    const updatedAt = new Date().toISOString();
    setLecturers((prev) => {
      const next = sortLecturers(
        prev.map((l) => (l.id === id ? { ...l, ...updates, updated_at: updatedAt } : l))
      );
      saveLocalLecturers(next);
      return next;
    });

    broadcastChange('UPDATE', { id, ...updates });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: err } = await supabase
          .from('lecturers')
          .update({ ...updates, updated_at: updatedAt })
          .eq('id', id);
        if (err) throw err;
      } catch (err: any) {
        console.error('Error updating lecturer in Supabase:', err);
      }
    }
  };

  // 4. Delete lecturer
  const deleteLecturer = async (id: string) => {
    setLecturers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveLocalLecturers(next);
      return next;
    });

    broadcastChange('DELETE', { id });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: err } = await supabase
          .from('lecturers')
          .delete()
          .eq('id', id);
        if (err) throw err;
      } catch (err: any) {
        console.error('Error deleting lecturer from Supabase:', err);
      }
    }
  };

  // 5. Reset to seeds
  const resetToSeeds = async () => {
    setLecturers(sortLecturers(INITIAL_LECTURERS));
    saveLocalLecturers(INITIAL_LECTURERS);
    broadcastChange('SYNC', INITIAL_LECTURERS);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lecturers').delete().neq('name', '___NON_EXISTENT___');
        for (const seed of INITIAL_LECTURERS) {
          await supabase.from('lecturers').insert({
            name: seed.name,
            room: seed.room,
            status: seed.status,
          });
        }
      } catch (e) {
        console.error('Error resetting database in Supabase:', e);
      }
    }
  };

  return {
    lecturers,
    isLoading,
    error,
    isRealtimeActive,
    updateStatus,
    addLecturer,
    updateLecturer,
    deleteLecturer,
    resetToSeeds,
    refresh: fetchLecturers,
  };
}
