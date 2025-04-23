export type CalendarEvent = {
    title: string;
    date: string; // ISO format "YYYY-MM-DD"
	time?: string; // 'HH:mm' format
	endTime?: string; // 'HH:mm' format
	description?: string;
	location?: string;
	label?: Label;
	completed: boolean;
};

export type Label = {
	// id: string; // unique, used as reference
	name: string;
	color: string; // hex or named color
};

export type CalendarState = {
    selectedDate: string | null;
    eventsByDate: Record<string, CalendarEvent[]>;
};

export type CalendarActions = {
    setSelectedDate: (date: string | null) => void;
    addEvent: (dateOrEvent: string | CalendarEvent, event?: CalendarEvent) => void;
    getEventsForDate: (date: string) => CalendarEvent[];
    setEventsByDate: (events: Record<string, CalendarEvent[]>) => void;
    updateEvent: (date: string, index: number, updated: Partial<CalendarEvent>) => void;
    deleteEvent: (date: string, index: number) => void;
    deleteAllEvents: () => void;
};
  