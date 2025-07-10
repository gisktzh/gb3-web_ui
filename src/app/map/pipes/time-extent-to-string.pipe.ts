import {Pipe, PipeTransform, inject} from '@angular/core';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {TIME_SERVICE} from '../../app.tokens';

@Pipe({
  name: 'timeExtentToString',
  standalone: true,
})
export class TimeExtentToStringPipe implements PipeTransform {
  private readonly timeService = inject<TimeService>(TIME_SERVICE);

  public transform(timeExtent: TimeExtent | undefined, dateFormat: string, hasSimpleCurrentValue: boolean): string {
    if (!timeExtent) {
      return '';
    }
    return hasSimpleCurrentValue
      ? this.convertDateToString(timeExtent.start, dateFormat)
      : `${this.convertDateToString(timeExtent.start, dateFormat)} - ${this.convertDateToString(timeExtent.end, dateFormat)}`;
  }

  private convertDateToString(value: Date, dateFormat: string): string {
    return value ? this.timeService.getDateAsFormattedString(value, dateFormat) : '';
  }
}
