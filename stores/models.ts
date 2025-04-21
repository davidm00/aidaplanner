export type CalendarEvent = {
    title: string;
    date: string; // ISO format "YYYY-MM-DD"
	time?: string; // 'HH:mm' format
	label?: Label;
	completed: boolean;
};

export type Label = {
	// id: string; // unique, used as reference
	name: string;
	color: string; // hex or named color
};
  