import {Injectable} from '@angular/core';
import {DateUnit, TimeService} from '../interfaces/time-service.interface';
import dayjs, {ManipulateType} from 'dayjs';
import {Duration} from 'dayjs/plugin/duration';

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

  public getISORangeInMilliseconds(range: string): number {
    return this.createDayjsDurationFromISOString(range).asMilliseconds();
  }

  public addMinimalRangeToDate(date: Date, unit: string): Date {
    return this.createDayjsObject(date)
      .add(1, unit as ManipulateType)
      .toDate();
  }

  public isStringSingleTimeUnitRange(range: string): boolean {
    const rangeDuration = this.createDayjsDurationFromISOString(range);
    const unit = this.extractUniqueUnitFromDuration(rangeDuration);
    return unit !== undefined && this.getDurationAsNumber(rangeDuration, unit) === 1;
  }

  public addRangeToDate(date: Date, range: string): Date {
    const duration = this.createDayjsDurationFromISOString(range);
    const unit = this.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return this.createDayjsObject(date).add(duration).toDate();
    }
    const value = this.getDurationAsNumber(duration, unit);
    return this.createDayjsObject(date).add(this.createDayjsDurationFromNumber(value, unit)).toDate();
  }

  public subtractRangeFromDate(date: Date, range: string): Date {
    const duration = this.createDayjsDurationFromISOString(range);
    const unit = this.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return this.createDayjsObject(date).subtract(duration).toDate();
    }
    const value = this.getDurationAsNumber(duration, unit);
    return this.createDayjsObject(date).subtract(this.createDayjsDurationFromNumber(value, unit)).toDate();
  }

  private createDayjsDurationFromNumber(value: number, unit: ManipulateType): Duration {
    return dayjs.duration(value, unit);
  }

  private createDayjsDurationFromISOString(range: string): Duration {
    return dayjs.duration(range);
  }

  /**
   * Extracts the unit from the given duration or <undefined> if it contains values with multiple units.
   *
   * @remarks
   * It does return a unit ('years'/'months'/...) only if the given duration contains values of this unit and nothing else; <undefined>
   *   otherwise.
   *
   * @example
   * 'P3Y' is a duration of 3 years. The duration only contains years and therefore this method returns 'years'
   * 'P1Y6M' is a duration of 1 year and 6 months. It contains years (1) and months (6) which is a mix of two units. The return value will
   *   be <undefined>.
   * */
  private extractUniqueUnitFromDuration(duration: Duration): ManipulateType | undefined {
    if (duration.years() === duration.asYears()) return 'years';
    if (duration.months() === duration.asMonths()) return 'months';
    if (duration.days() === duration.asDays()) return 'days';
    if (duration.hours() === duration.asHours()) return 'hours';
    if (duration.minutes() === duration.asMinutes()) return 'minutes';
    if (duration.seconds() === duration.asSeconds()) return 'seconds';
    if (duration.milliseconds() === duration.asMilliseconds()) return 'milliseconds';
    return undefined;
  }

  /**
   * Gets the whole given duration as a number value in the desired unit.
   */
  private getDurationAsNumber(duration: Duration, unit: ManipulateType): number {
    // todo: this one as well
    switch (unit) {
      case 'ms':
      case 'millisecond':
      case 'milliseconds':
        return duration.asMilliseconds();
      case 'second':
      case 'seconds':
      case 's':
        return duration.asSeconds();
      case 'minute':
      case 'minutes':
      case 'm':
        return duration.asMinutes();
      case 'hour':
      case 'hours':
      case 'h':
        return duration.asHours();
      case 'd':
      case 'D':
      case 'day':
      case 'days':
        return duration.asDays();
      case 'M':
      case 'month':
      case 'months':
        return duration.asMonths();
      case 'y':
      case 'year':
      case 'years':
        return duration.asYears();
      case 'w':
      case 'week':
      case 'weeks':
        return duration.asWeeks();
    }
  }

  private createDayjsObject(date: Date | string, format?: string): dayjs.Dayjs {
    return dayjs(date, format);
  }

  private createUTCDayjsObject(date: Date | string, format?: string): dayjs.Dayjs {
    return dayjs.utc(date, format);
  }
}
