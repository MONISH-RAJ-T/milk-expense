export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Returns date in local 'YYYY-MM-DD' format.
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Returns month in local 'YYYY-MM' format.
 */
export function formatMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  return `${year}-${month}`;
}

export function parseDateKey(dateKey: string): Date {
  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateKey(d);
}

/**
 * Returns true if the given dateKey is after today.
 */
export function isFutureDate(dateKey: string, todayKey: string = getTodayKey()): boolean {
  return dateKey > todayKey;
}

/**
 * Business Rule: Only dates before or on today can be selected/edited.
 * Tomorrow and future dates are strictly locked.
 */
export function isEditableDate(dateKey: string, todayKey: string = getTodayKey()): boolean {
  return dateKey <= todayKey;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] || '';
}

export function formatMonthHeader(year: number, monthIndex: number): string {
  return `${getMonthName(monthIndex)} ${year}`;
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = getMonthName(date.getMonth()).slice(0, 3);
  return `${dayName} ${day} ${month}`;
}

export function formatDisplayDateFull(dateKey: string): string {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const display = formatDisplayDate(dateKey);

  if (dateKey === todayKey) {
    return `Today - ${display}`;
  }
  if (dateKey === yesterdayKey) {
    return `Yesterday - ${display}`;
  }
  return display;
}

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isEditable: boolean;
}

/**
 * Generates grid of days for a calendar month including padding from previous/next months.
 */
export function generateCalendarGrid(year: number, monthIndex: number): CalendarDay[] {
  const todayKey = getTodayKey();
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 for Sunday
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const grid: CalendarDay[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const prevDate = new Date(year, monthIndex - 1, dayNumber);
    const dateKey = formatDateKey(prevDate);
    grid.push({
      dateKey,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey, todayKey),
      isEditable: isEditableDate(dateKey, todayKey),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateKey = formatDateKey(date);
    grid.push({
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey, todayKey),
      isEditable: isEditableDate(dateKey, todayKey),
    });
  }

  // Trailing next month days to complete rows (up to 35 or 42 cells)
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    const nextDate = new Date(year, monthIndex + 1, nextDay);
    const dateKey = formatDateKey(nextDate);
    grid.push({
      dateKey,
      dayNumber: nextDay,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey, todayKey),
      isEditable: isEditableDate(dateKey, todayKey),
    });
  }

  return grid;
}
