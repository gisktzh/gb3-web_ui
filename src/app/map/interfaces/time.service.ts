import {Duration} from 'dayjs/plugin/duration';
import {ManipulateType, UnitType} from 'dayjs';

export interface TimeService {
  getPartial(date: string, unit: UnitType): number;

  getDateAsString(date: Date, format: string): string;

  getDate(date: string, format: string): Date;

  getUTCDate(date: Date, format?: string): Date;

  getUnixDate(created: number): Date;

  getDuration(time: string | number, unit?: ManipulateType): Duration;

  isValidDate(value: string): boolean;

  addDuration(date: Date, durationToAdd: Duration): Date;

  subtractDuration(date: Date, durationToSubtract: Duration): Date;

  calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number;
}
