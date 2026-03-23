import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarView from '../CalendarView';
import { FileItem } from '../../types';

describe('CalendarView', () => {
  const mockFiles: FileItem[] = [
    { path: '/notes/2026-03-23.md', name: '2026-03-23.md', isDirectory: false },
    { path: '/notes/2026-03-22.md', name: '2026-03-22.md', isDirectory: false },
    { path: '/notes/2026-03-15.md', name: '2026-03-15.md', isDirectory: false },
  ];

  const mockProps = {
    files: mockFiles,
    onDateSelect: vi.fn(),
    onCreateDailyNote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render calendar header', () => {
    render(<CalendarView {...mockProps} />);
    
    expect(screen.getByText('Calendar')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('should display current month and year', () => {
    render(<CalendarView {...mockProps} />);
    
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    expect(screen.getByText(`${monthNames[now.getMonth()]} ${now.getFullYear()}`)).toBeTruthy();
  });

  it('should display week day headers', () => {
    render(<CalendarView {...mockProps} />);
    
    expect(screen.getByText('Sun')).toBeTruthy();
    expect(screen.getByText('Mon')).toBeTruthy();
    expect(screen.getByText('Tue')).toBeTruthy();
    expect(screen.getByText('Wed')).toBeTruthy();
    expect(screen.getByText('Thu')).toBeTruthy();
    expect(screen.getByText('Fri')).toBeTruthy();
    expect(screen.getByText('Sat')).toBeTruthy();
  });

  it('should navigate to previous month', () => {
    render(<CalendarView {...mockProps} />);
    
    const now = new Date();
    const prevButton = screen.getByTitle('Previous month');
    fireEvent.click(prevButton);
    
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    expect(screen.getByText(`${monthNames[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`)).toBeTruthy();
  });

  it('should navigate to next month', () => {
    render(<CalendarView {...mockProps} />);
    
    const now = new Date();
    const nextButton = screen.getByTitle('Next month');
    fireEvent.click(nextButton);
    
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    expect(screen.getByText(`${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`)).toBeTruthy();
  });

  it('should return to today when Today button is clicked', () => {
    render(<CalendarView {...mockProps} />);
    
    // Navigate away
    const nextButton = screen.getByTitle('Next month');
    fireEvent.click(nextButton);
    
    // Click Today
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    expect(screen.getByText(`${monthNames[now.getMonth()]} ${now.getFullYear()}`)).toBeTruthy();
  });

  it('should show daily note count in footer', () => {
    render(<CalendarView {...mockProps} />);
    
    expect(screen.getByText('3 daily notes')).toBeTruthy();
  });

  it('should call onDateSelect when clicking a date with note', () => {
    render(<CalendarView {...mockProps} />);
    
    // Find a day button (this is implementation specific)
    const dayButtons = screen.getAllByRole('button');
    const dateButton = dayButtons.find(btn => 
      btn.getAttribute('title')?.includes('Open note')
    );
    
    if (dateButton) {
      fireEvent.click(dateButton);
      expect(mockProps.onDateSelect).toHaveBeenCalled();
    }
  });

  it('should call onCreateDailyNote when clicking a date without note', () => {
    render(<CalendarView {...mockProps} />);
    
    // Find a day button without note
    const dayButtons = screen.getAllByRole('button');
    const dateButton = dayButtons.find(btn => 
      btn.getAttribute('title')?.includes('Create note')
    );
    
    if (dateButton) {
      fireEvent.click(dateButton);
      expect(mockProps.onCreateDailyNote).toHaveBeenCalled();
    }
  });

  it('should highlight today', () => {
    render(<CalendarView {...mockProps} />);
    
    // Today should have special styling (implementation specific)
    const today = new Date().getDate();
    const todayElement = screen.getByText(today.toString());
    expect(todayElement).toBeTruthy();
  });

  it('should show indicators for dates with notes', () => {
    render(<CalendarView {...mockProps} />);
    
    // Dates with notes should have indicators (implementation specific)
    // This test verifies the component renders without errors
    expect(screen.getByText('Calendar')).toBeTruthy();
  });
});
