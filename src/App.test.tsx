import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';
import { INITIAL_LECTURERS } from './types/database';

describe('Smart Multi-Lecturer Availability Display System', () => {
  it('contains the 7 required seeded lecturers', () => {
    expect(INITIAL_LECTURERS).toHaveLength(7);

    const names = INITIAL_LECTURERS.map((l) => l.name);
    expect(names).toContain('Dr. Ravi Kumar');
    expect(names).toContain('Dr. Meena Sharma');
    expect(names).toContain('Prof. Arjun Patel');
    expect(names).toContain('Dr. Priya Nair');
    expect(names).toContain('Prof. Suresh Reddy');
    expect(names).toContain('Dr. Anita Gupta');
    expect(names).toContain('Prof. Vikram Singh');
  });

  it('contains the correct initial rooms and statuses', () => {
    const ravi = INITIAL_LECTURERS.find((l) => l.name === 'Dr. Ravi Kumar');
    expect(ravi).toBeDefined();
    expect(ravi?.room).toBe('C204');
    expect(ravi?.status).toBe('Available');

    const meena = INITIAL_LECTURERS.find((l) => l.name === 'Dr. Meena Sharma');
    expect(meena).toBeDefined();
    expect(meena?.room).toBe('C210');
    expect(meena?.status).toBe('Busy');

    const priya = INITIAL_LECTURERS.find((l) => l.name === 'Dr. Priya Nair');
    expect(priya).toBeDefined();
    expect(priya?.room).toBe('A105');
    expect(priya?.status).toBe('Not Available');
  });

  it('renders the Role Selector with 4 main role options', () => {
    render(<App />);

    expect(screen.getAllByText(/Lecturer Availability/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Lecturer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Student View')).toBeInTheDocument();
    expect(screen.getByText('IoT ESP32 Display')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('navigates to Lecturer Dashboard and displays status buttons', async () => {
    render(<App />);

    const lecturerCard = screen.getByText('Lecturer Dashboard');
    fireEvent.click(lecturerCard);

    expect(await screen.findByText('Faculty Profile Selection')).toBeInTheDocument();
    expect(screen.getByText('Update Availability Status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Available' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Busy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Not Available' })).toBeInTheDocument();
  });

  it('navigates to Student View and displays live directory with search', async () => {
    render(<App />);

    const studentCard = screen.getByText('Student View');
    fireEvent.click(studentCard);

    expect(await screen.findByText('Faculty Availability Directory')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by lecturer name or room number/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Ravi Kumar')).toBeInTheDocument();
  });

  it('navigates to IoT Display and simulates ESP32 panel', async () => {
    render(<App />);

    const iotCard = screen.getByText('IoT ESP32 Display');
    fireEvent.click(iotCard);

    expect(await screen.findByText(/CAMPUS FACULTY AVAILABILITY TERMINAL/i)).toBeInTheDocument();
    expect(screen.getByText(/ESP32-S3/i)).toBeInTheDocument();
  });

  it('navigates to Admin Panel and displays add lecturer form and faculty list', async () => {
    render(<App />);

    const adminCard = screen.getByText('Admin Panel');
    fireEvent.click(adminCard);

    expect(await screen.findByText('Faculty Directory Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Faculty Member')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Dr\. Rajesh Kumar/i)).toBeInTheDocument();
  });
});
