import {Pipe, PipeTransform} from '@angular/core';
import {hyphenateSync as hyphenate} from 'hyphen/de';

@Pipe({
  name: 'hyphenate',
  standalone: true,
})
export class HyphenatePipe implements PipeTransform {
  public transform(value: string): string {
    return hyphenate(value);
  }
}
