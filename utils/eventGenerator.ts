import { CalendarEvent } from '@/stores/models';

const EVENT_TITLES = ['Meeting', 'Lunch', 'Coffee', 'Gym', 'Study', 'Movie', 'Dinner', 'Shopping'];
const LOCATIONS = ['Office', 'Cafe', 'Home', 'Park', 'Mall', 'Restaurant', 'Library'];
const COLORS = ['#ff4d4d', '#ffa500', '#007aff', '#28a745', '#e91e63', '#9c27b0', '#009688', '#795548'];

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEventForTime(date: Date, startHour: number): CalendarEvent {
  const startMinute = Math.floor(Math.random() * 12) * 5; // Round to nearest 5 minutes
  const durationMinutes = (Math.floor(Math.random() * 6) + 1) * 30; // 30min to 3hrs
  
  const totalEndMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor(totalEndMinutes / 60);
  const endMinute = totalEndMinutes % 60;
  
  return {
    title: getRandomItem(EVENT_TITLES),
    date: date.toISOString().split('T')[0],
    time: formatTime(startHour, startMinute),
    endTime: formatTime(endHour, endMinute),
    location: getRandomItem(LOCATIONS),
    label: {
      name: 'Random',
      color: getRandomItem(COLORS)
    },
    completed: false
  };
}

export function generateRandomEvents(selectedDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const currentDate = new Date(selectedDate);
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // First, generate 3-4 busy days with 4-6 events each
  const busyDays = new Set<number>();
  while (busyDays.size < 3) {
    busyDays.add(Math.floor(Math.random() * daysInMonth) + 1);
  }
  
  // Generate events for busy days
  for (const day of busyDays) {
    const date = new Date(firstDay);
    date.setDate(day);
    
    // Generate 4-6 events for this day
    const numEvents = Math.floor(Math.random() * 3) + 4; // 4-6 events
    const usedHours = new Set<number>();
    
    // Ensure events are spread throughout the day
    const daySegments = [
      [7, 10],  // Morning
      [11, 13], // Lunch
      [14, 16], // Afternoon
      [17, 20]  // Evening
    ];
    
    for (let i = 0; i < numEvents; i++) {
      // Pick a time segment that hasn't been fully used
      const availableSegments = daySegments.filter(([start, end]) => 
        !Array.from({ length: end - start + 1 }, (_, i) => start + i)
          .every(hour => usedHours.has(hour))
      );
      
      if (availableSegments.length === 0) break;
      
      const [start, end] = getRandomItem(availableSegments);
      let startHour;
      do {
        startHour = Math.floor(Math.random() * (end - start + 1)) + start;
      } while (usedHours.has(startHour));
      
      usedHours.add(startHour);
      events.push(generateEventForTime(date, startHour));
    }
  }
  
  // Generate remaining random events (10-15 events)
  const remainingEvents = Math.floor(Math.random() * 6) + 10;
  
  for (let i = 0; i < remainingEvents; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    if (busyDays.has(day)) continue; // Skip busy days
    
    const date = new Date(firstDay);
    date.setDate(day);
    
    // Random start hour between 7 AM and 8 PM
    const startHour = Math.floor(Math.random() * 14) + 7;
    events.push(generateEventForTime(date, startHour));
  }
  
  return events;
} 