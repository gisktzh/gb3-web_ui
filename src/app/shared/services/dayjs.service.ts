import {Injectable} from '@angular/core';
import {DateUnit, TimeService} from '../interfaces/time-service.interface';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class DayjsService implements TimeService {
  public getDateFromString(date: string, format?: string): Date {
    return this.createDayjsObject(date, format).toDate();
  }

  public getDateAsFormattedString(date: Date, format: string): string {
    return this.createDayjsObject(date).format(format);
  }

  public getDateAsUTCString(date: Date, format?: string): string {
    return this.createUTCDayjsObject(date).format(format);
  }

  public getPartialFromString(date: string, unit: DateUnit): number {
    return this.createDayjsObject(date).get(unit);
  }

  public getDateFromUnixTimestamp(timestamp: number): Date {
    return dayjs.unix(timestamp).toDate();
  }

  public getUTCDateFromString(date: string, format?: string): Date {
    return this.createUTCDayjsObject(date, format).toDate();
  }

  public isDate(value: string): boolean {
    return this.createDayjsObject(value).isValid();
  }

  public calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number {
    return Math.abs(this.createDayjsObject(secondDate).diff(this.createDayjsObject(firstDate)));
  }

  private createDayjsObject(date: Date | string, format?: string): dayjs.Dayjs {
    return dayjs(date, format);
  }

  private createUTCDayjsObject(date: Date | string, format?: string): dayjs.Dayjs {
    return dayjs.utc(date, format);
  }
}
