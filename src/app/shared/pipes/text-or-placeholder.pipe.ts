import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textOrPlaceholder',
  standalone: true,
})
export class TextOrPlaceholderPipe implements PipeTransform {
  transform(value: string | null): string {
    return value ?? '-';
  }
}
