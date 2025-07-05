export type DateRangeType = 'today' | 'tomorrow' | 'this-week' | 'next-week';

export interface DateRange {
  name: string;
  followup_date_start: string;
  followup_date_end: string;
}

export const getDateRange = (type: DateRangeType): DateRange => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const tomorrow = new Date(startOfToday);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper function to format date as yyyy-mm-dd
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (type) {
    case "today":
      return {
        name: "Today",
        followup_date_start: formatDate(startOfToday),
        followup_date_end: formatDate(endOfToday),
      };
    case "tomorrow":
      return {
        name: "Next Day",
        followup_date_start: formatDate(tomorrow),
        followup_date_end: formatDate(tomorrow),
      };
    case "this-week": {
      const start = new Date(startOfToday);
      const end = new Date(start);
      end.setDate(start.getDate() + (6 - start.getDay()));
      return {
        name: "This Week",
        followup_date_start: formatDate(start),
        followup_date_end: formatDate(end),
      };
    }
    case "next-week": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() + (7 - start.getDay()));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        name: "Next Week",
        followup_date_start: formatDate(start),
        followup_date_end: formatDate(end),
      };
    }
  }
};