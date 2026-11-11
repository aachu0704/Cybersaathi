export type LecturerStatus = 'Available' | 'Busy' | 'Not Available';

export interface Lecturer {
  id: string;
  name: string;
  room: string;
  status: LecturerStatus;
  created_at?: string;
  updated_at?: string;
}

export type Database = {
  public: {
    Tables: {
      lecturers: {
        Row: Lecturer;
        Insert: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Lecturer, 'id'>> & {
          updated_at?: string;
        };
      };
    };
  };
};

export const INITIAL_LECTURERS: Lecturer[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Dr. Ravi Kumar', room: 'C204', status: 'Available' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Dr. Meena Sharma', room: 'C210', status: 'Busy' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Prof. Arjun Patel', room: 'B301', status: 'Available' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Dr. Priya Nair', room: 'A105', status: 'Not Available' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Prof. Suresh Reddy', room: 'D402', status: 'Available' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Dr. Anita Gupta', room: 'C312', status: 'Busy' },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Prof. Vikram Singh', room: 'B208', status: 'Available' },
];
