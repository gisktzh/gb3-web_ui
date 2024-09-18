import {Pipe, PipeTransform} from '@angular/core';
import {DayjsUtils} from '../../shared/utils/dayjs.utils';

@Pipe({
  name: 'dateToString',
  standalone: true,
})
export class DateToStringPipe implements PipeTransform {
  constructor() {}
  public transform(value: Date | undefined, dateFormat: string): string {
    return value ? DayjsUtils.getDateAsString(value, dateFormat) : '';
  }
}
