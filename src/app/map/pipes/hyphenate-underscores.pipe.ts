import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'hyphenateUnderscores',
  standalone: true,
})
export class HyphenateUnderscoresPipe implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/(?<=\w)_(?=\w)/g, '_\u00AD');
  }
}
