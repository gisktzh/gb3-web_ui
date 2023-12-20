import {Pipe, PipeTransform} from '@angular/core';
import {TimeExtent} from '../interfaces/time-extent.interface';
import dayjs from 'dayjs';

@Pipe({
  name: 'timeExtentToString',
  standalone: true,
})
export class TimeExtentToStringPipe implements PipeTransform {
  public transform(timeExtent: TimeExtent | undefined, dateFormat: string, hasSimpleCurrentValue: boolean): string {
    if (!timeExtent) {
      return '';
    }
    return hasSimpleCurrentValue
      ? this.convertDateToString(timeExtent.start, dateFormat)
      : `${this.convertDateToString(timeExtent.start, dateFormat)} - ${this.convertDateToString(timeExtent.end, dateFormat)}`;
  }

  private convertDateToString(value: Date, dateFormat: string): string {
    return value ? dayjs(value).format(dateFormat) : '';
  }
}
