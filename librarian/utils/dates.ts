export type Month = {
  full: string;
  abbreviation: string;
};

export const months: Month[] = [
  { full: "January", abbreviation: "Jan" },
  { full: "February", abbreviation: "Feb" },
  { full: "March", abbreviation: "Mar" },
  { full: "April", abbreviation: "Apr" },
  { full: "May", abbreviation: "May" },
  { full: "June", abbreviation: "Jun" },
  { full: "July", abbreviation: "Jul" },
  { full: "August", abbreviation: "Aug" },
  { full: "September", abbreviation: "Sep" },
  { full: "October", abbreviation: "Oct" },
  { full: "November", abbreviation: "Nov" },
  { full: "December", abbreviation: "Dec" },
];

export const hasMonthInString = (input: string): boolean => {
  return months.some(month => 
      input.includes(month.full) || input.includes(month.abbreviation)
  );
}
