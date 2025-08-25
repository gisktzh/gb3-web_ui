import {Pipe, PipeTransform, inject} from '@angular/core';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {TIME_SERVICE} from '../../app.tokens';

@Pipe({
  name: 'dateToString',
  standalone: true,
})
export class DateToStringPipe implements PipeTransform {
  private readonly timeService = inject<TimeService>(TIME_SERVICE);

  public transform(value: Date | undefined, dateFormat: string): string {
    return value ? this.timeService.getDateAsFormattedString(value, dateFormat) : '';
  }
}
