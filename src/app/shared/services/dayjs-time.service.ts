import {TimeService} from '../../map/interfaces/time.service';
import dayjs, {ManipulateType, UnitType} from 'dayjs';
import duration, {Duration} from 'dayjs/plugin/duration';
import {Injectable} from '@angular/core';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class DayjsTimeService implements TimeService {
  public getPartial(date: string, unit: UnitType): number {
    return dayjs(date, unit).get(unit);
  }
  public getDateAsString(date: Date, format: string): string {
    return dayjs(date).format(format);
  }
  public getDate(date: string, format: string): Date {
    return dayjs(date, format).toDate();
  }
  public getUTCDateAsString(date: Date, format?: string): string {
    return dayjs.utc(date).format(format);
  }
  public getUnixDate(created: number): Date {
    return dayjs.unix(created).toDate();
  }
  public static parseUTCDate(date: string, format?: string): Date {
    return dayjs.utc(date, format).toDate();
  }
  public static getDuration(time: string): Duration {
    return dayjs.duration(time);
  }
  public static getDurationWithUnit(time: number, unit?: ManipulateType): Duration {
    return dayjs.duration(time, unit);
  }
  public static isValidDate(value: string): boolean {
    return dayjs(value).isValid();
  }
  public static addDuration(date: Date, durationToAdd: Duration): Date {
    return dayjs(date).add(durationToAdd).toDate();
  }
  public static subtractDuration(date: Date, durationToSubtract: Duration): Date {
    return dayjs(date).subtract(durationToSubtract).toDate();
  }
  public static calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number {
    return Math.abs(dayjs(secondDate).diff(dayjs(firstDate)));
  }
}
