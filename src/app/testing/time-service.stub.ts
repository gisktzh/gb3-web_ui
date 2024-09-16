import {TimeService} from '../map/interfaces/time.service';

export class TimeServiceStub implements TimeService {
  public getPartial(date: string, unit: any): number {
    return 0;
  }

  public getDateAsString(date: Date, format: string): string {
    return '';
  }

  public getDate(date: string, format: string): Date {
    return new Date();
  }

  public getUTCDate(date: Date, format?: string): Date {
    return new Date();
  }

  public getUnixDate(created: number): Date {
    return new Date();
  }

  public getDuration(time: string | number, unit?: any): any {
    return {};
  }

  public isValidDate(value: string): boolean {
    return true;
  }

  public addDuration(date: Date, durationToAdd: any): Date {
    return new Date();
  }

  public subtractDuration(date: Date, durationToSubtract: any): Date {
    return new Date();
  }

  public calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number {
    return 0;
  }
}
