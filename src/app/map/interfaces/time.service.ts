import {UnitType} from 'dayjs';

export interface TimeService {
  getPartial(date: string, unit: UnitType): number;

  getDateAsString(date: Date, format: string): string;

  getDate(date: string, format: string): Date;

  getUTCDateAsString(date: Date, format?: string): string;

  getUnixDate(created: number): Date;
}
