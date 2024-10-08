import {Inject, Pipe, PipeTransform} from '@angular/core';
import {TIME_SERVICE} from '../../app.module';
import {TimeService} from '../../shared/interfaces/time-service.interface';

@Pipe({
  name: 'dateToString',
  standalone: true,
})
export class DateToStringPipe implements PipeTransform {
  constructor(@Inject(TIME_SERVICE) private readonly timeService: TimeService) {}

  public transform(value: Date | undefined, dateFormat: string): string {
    return value ? this.timeService.getDateAsFormattedString(value, dateFormat) : '';
  }
}
