export type DateRangeType = 'today' | 'tomorrow' | 'this-week' | 'next-week';

export interface DateRange {
  name: string;
  followup_date_start: Date;
  followup_date_end: Date;
}

export const getDateRange = (type: DateRangeType): DateRange => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const tomorrow = new Date(startOfToday);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

  switch (type) {
    case "today":
      return {
        name: "Today",
        followup_date_start: startOfToday,
        followup_date_end: endOfToday,
      };
    case "tomorrow":
      return {
        name: "Next Day",
        followup_date_start: tomorrow,
        followup_date_end: endOfTomorrow,
      };
    case "this-week": { // Get range for the current week, starting from monday
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Adjust to start from Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // End on Sunday
      
      endOfWeek.setHours(23, 59, 59, 999); // Set to end of day
      startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

      return {
        name: "This Week",
        followup_date_start: startOfWeek,
        followup_date_end: endOfWeek,
      };
    }
    case "next-week": { // Get range for the next week, starting from next monday
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - start.getDay() + 8); // Next Monday
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // End on next Sunday

      end.setHours(23, 59, 59, 999); // Set to end of day
      start.setHours(0, 0, 0, 0); // Set to start of day
      return {
        name: "Next Week",
        followup_date_start: start,
        followup_date_end: end,
      };
    }
  }
};