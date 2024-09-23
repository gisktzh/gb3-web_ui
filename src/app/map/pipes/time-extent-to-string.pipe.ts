import {Inject, Pipe, PipeTransform} from '@angular/core';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TIME_SERVICE} from '../../app.module';
import {TimeService} from '../../shared/interfaces/time-service.interface';

@Pipe({
  name: 'timeExtentToString',
  standalone: true,
})
export class TimeExtentToStringPipe implements PipeTransform {
  constructor(@Inject(TIME_SERVICE) private readonly timeService: TimeService) {}

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
