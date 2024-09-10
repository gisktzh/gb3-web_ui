import {TimeService} from '../../map/interfaces/time.service';
import dayjs, {ManipulateType, UnitType} from 'dayjs';
import duration, {Duration} from 'dayjs/plugin/duration';
import {Injectable} from '@angular/core';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

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
  public getUTCDate(date: Date, format?: string): Date {
    return dayjs.utc(date, format).toDate();
  }
  public getUnixDate(created: number): Date {
    return dayjs.unix(created).toDate();
  }
  public getDuration(time: string | number, unit?: ManipulateType): Duration {
    return dayjs.duration(time, unit);
  }
  public isValidDate(value: string): boolean {
    return dayjs(value).isValid();
  }
  public addDuration(date: Date, durationToAdd: Duration): Date {
    return dayjs(date).add(durationToAdd).toDate();
  }
  public subtractDuration(date: Date, durationToSubtract: Duration): Date {
    return dayjs(date).subtract(durationToSubtract).toDate();
  }
  public calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number {
    return Math.abs(dayjs(secondDate).diff(dayjs(firstDate)));
  }
}
