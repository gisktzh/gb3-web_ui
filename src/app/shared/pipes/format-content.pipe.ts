import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatContent'
})
export class FormatContentPipe implements PipeTransform {
  public transform(value: string): string {
    return this.replaceUrls(value);
  }

  public replaceUrls(value: string): string {
    // see: https://stackoverflow.com/a/3809435
    const urlCapturingGroup = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;
    return value.replace(urlCapturingGroup, '<a href="$1" target="_blank">$1</a>');
  }
}
