import { v4 as uuidv4 } from 'uuid';
import { makeAutoObservable } from 'mobx';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  color?: string;
}

export class EventStore {
  events: CalendarEvent[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addEvent(event: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = {
      ...event,
      id: uuidv4(),
    };
    this.events.push(newEvent);
    this.saveEvents();
  }

  private saveEvents() {
    // TODO: Implement persistence logic
    console.log('Saving events:', this.events);
  }
}

export const eventStore = new EventStore(); 