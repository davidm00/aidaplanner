export function generateCalendarMatrix(year: number, month: number): (number | null)[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
  
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const weeks: (number | null)[][] = [[]];
  
    // Fill initial empty slots
    for (let i = 0; i < startWeekday; i++) {
      weeks[0].push(null);
    }
  
    for (let day = 1; day <= numDays; day++) {
      const currentWeek = weeks[weeks.length - 1];
      currentWeek.push(day);
  
      if (currentWeek.length === 7 && day !== numDays) {
        weeks.push([]);
      }
    }
  
    // Fill remaining empty slots in last week
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(null);
    }
  
    return weeks;
  }
  
  export function getLocalDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 1-indexed
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`; // e.g. "2025-04-24"
  }