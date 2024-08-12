import {Pipe, PipeTransform} from '@angular/core';

/**
 * This regex matches
 * * \r\n directly
 * * \r because \n is optional
 * * \n directly if neither \r\n nor \r are present
 *
 * The reason for this is that the data from the GB3 backend is inconsistent and uses all three line breaks.
 */
const LINE_BREAK_REGEX = /\r\n?|\n/g;

@Pipe({
  name: 'formatLineBreaks',
  standalone: true,
})
export class FormatLineBreaksPipe implements PipeTransform {
  public transform(value: string): string {
    return value.replace(LINE_BREAK_REGEX, '<br />');
  }
}
