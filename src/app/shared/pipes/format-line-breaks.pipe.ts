import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatLineBreaks',
  standalone: true,
})
export class FormatLineBreaksPipe implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/\r\n/g, '<br>');
  }
}
