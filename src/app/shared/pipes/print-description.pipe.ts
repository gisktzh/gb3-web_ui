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
    const titleText = this.getTitleText(title);
    const commentText = this.getCommentText(comment);
    return `Beschriftung: ${titleText}, ${commentText}`;
  }

  private getTitleText(title: string | null): string {
    return `Kartentitel: ${title !== '' && title !== null ? title : '-'}`;
  }

  private getCommentText(comment: string | null): string {
    return `Kommentar: ${comment !== '' && comment !== null ? comment : '-'}`;
  }
}
