import { create } from 'zustand';

import { CalendarEvent, CalendarState, CalendarActions } from './models';
import { getLocalDateString } from '@/utils/calendar';

export const useCalendarStore = create<CalendarState & CalendarActions>((set, get) => ({
  // Default to today
  selectedDate: getLocalDateString(),
  eventsByDate: {},

  setSelectedDate: (date) => {
    // console.log('Selected date:', date);
    set({ selectedDate: date });
  },

  addEvent: (dateOrEvent: string | CalendarEvent, event?: CalendarEvent) => {
    if (typeof dateOrEvent === 'string' && event) {
      // Called with (date, event)
      set((state) => ({
        eventsByDate: {
          ...state.eventsByDate,
          [dateOrEvent]: [
            ...(state.eventsByDate[dateOrEvent] || []),
            { ...event, completed: false }
          ],
        }
      }));
    } else if (typeof dateOrEvent === 'object') {
      // Called with just (event)
      const event = dateOrEvent;
      set((state) => ({
        eventsByDate: {
          ...state.eventsByDate,
          [event.date]: [
            ...(state.eventsByDate[event.date] || []),
            { ...event, completed: false }
          ],
        }
      }));
    }
  },

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

  deleteAllEvents: () => set({ eventsByDate: {} }),
}));
