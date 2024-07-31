import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'printDescription',
  standalone: true,
})
export class PrintDescriptionPipe implements PipeTransform {
  public transform(completed: boolean, title: string | null, comment: string | null): string {
    if (!completed) {
      return 'Beschriftung';
    }
    const titleText = this.getTextSnippet(title, 'Kartentitel');
    const commentText = this.getTextSnippet(comment, 'Kommentar');
    return `Beschriftung: ${titleText}, ${commentText}`;
  }

  private getTextSnippet(text: string | null, prefix: string): string {
    return `${prefix}: ${text !== '' && text !== null ? text : '-'}`;
  }
}
