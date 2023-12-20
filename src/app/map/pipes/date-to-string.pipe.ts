import {Pipe, PipeTransform} from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'dateToString',
  standalone: true,
})
export class DateToStringPipe implements PipeTransform {
  public transform(value: Date | undefined, dateFormat: string): string {
    return value ? dayjs(value).format(dateFormat) : '';
  }
}
