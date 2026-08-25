import {
  startOfDay as fnsStartOfDay,
  endOfDay as fnsEndOfDay,
  addDays as fnsAddDays,
  differenceInMinutes as fnsDifferenceInMinutes,
  format as fnsFormat,
  isWeekend as fnsIsWeekend,
} from 'date-fns';

export const startOfDay = (date: Date): Date => fnsStartOfDay(date);

export const endOfDay = (date: Date): Date => fnsEndOfDay(date);

export const addDays = (date: Date, amount: number): Date =>
  fnsAddDays(date, amount);

export const differenceInMinutes = (dateLeft: Date, dateRight: Date): number =>
  fnsDifferenceInMinutes(dateLeft, dateRight);

export const formatDate = (
  date: Date,
  formatStr: string = 'yyyy-MM-dd',
): string => fnsFormat(date, formatStr);

export const isWeekend = (date: Date): boolean => fnsIsWeekend(date);

export const parseTimeString = (
  timeStr: string,
  baseDate: Date = new Date(),
): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const toUtcDate = (date: Date | string): Date => new Date(date);
