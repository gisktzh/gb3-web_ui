import dayjs from 'dayjs';
import {ManipulateTypeAlias as ManipulateType, UnitTypeAlias as UnitType} from '../types/dayjs-alias-type';
import duration, {Duration} from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export class DayjsUtils {
  public static getPartial(date: string, unit: UnitType): number {
    return dayjs(date).get(unit);
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

  public static addDuration(date: Date, durationToAdd: Duration): Date {
    return dayjs(date).add(durationToAdd).toDate();
  }
  public static subtractDuration(date: Date, durationToSubtract: Duration): Date {
    return dayjs(date).subtract(durationToSubtract).toDate();
  }
}
