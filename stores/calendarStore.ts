import { create } from 'zustand';

import { CalendarEvent } from './models';
import { getLocalDateString } from '@/utils/calendar';

type CalendarState = {
  selectedDate: string | null;
  eventsByDate: Record<string, CalendarEvent[]>;
};

type CalendarActions = {
  setSelectedDate: (date: string | null) => void;
  addEvent: (event: CalendarEvent) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  setEventsByDate: (events: Record<string, CalendarEvent[]>) => void;
  updateEvent: (date: string, index: number, updated: Partial<CalendarEvent>) => void;
  deleteEvent: (date: string, index: number) => void;
};

export const useCalendarStore = create<CalendarState & CalendarActions>((set, get) => ({
  // Default to today
  selectedDate: getLocalDateString(),
  eventsByDate: {},

  setSelectedDate: (date) => {
    // console.log('Selected date:', date);
    set({ selectedDate: date });
  },

  addEvent: (event) =>
    set((state) => {
      const updatedEventsByDate = {
        ...state.eventsByDate,
        [event.date]: [
          ...(state.eventsByDate[event.date] || []),
          event,
        ],
      };
      // console.log('Updated eventsByDate:', updatedEventsByDate);
      return { eventsByDate: updatedEventsByDate };
    }),
  getEventsForDate: (date) => {
    const { eventsByDate } = get();
    const events = eventsByDate[date] || [];
    // console.log(`Events for date ${date}:`, events);
    return events;
  },
  setEventsByDate: (newEvents) => set({ eventsByDate: newEvents }),
  updateEvent: (date: string, index: number, updated: Partial<CalendarEvent>) =>
    set((state) => {
      const events = state.eventsByDate[date] || [];
      const updatedEvents = [...events];
      updatedEvents[index] = { ...updatedEvents[index], ...updated };
      return {
        eventsByDate: {
          ...state.eventsByDate,
          [date]: updatedEvents,
        },
      };
    }),
  deleteEvent: (date: string, index: number) =>
    set((state) => {
      const events = state.eventsByDate[date] || [];
      const updatedEvents = events.filter((_, i) => i !== index);
      return {
        eventsByDate: {
          ...state.eventsByDate,
          [date]: updatedEvents,
        },
      };
    }),
  
}));
