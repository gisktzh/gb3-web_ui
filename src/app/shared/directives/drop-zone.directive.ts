import {Directive, output, signal} from '@angular/core';

@Directive({
  selector: '[dropZone]',
  standalone: true,
  host: {
    '(dragover)': 'handleDragOver($event)',
    '(dragleave)': 'handleDragLeave($event)',
    '(drop)': 'handleDrop($event)',
  },
})
export class DropZoneDirective {
  public readonly isHovered = signal(false);
  public readonly fileUploaded = output<FileList>();
  public readonly hoverStateChange = output<boolean>();

  public handleDragOver(e: DragEvent) {
    e.stopPropagation();
    this.hoverStateChange.emit(true);

    if (e.dataTransfer?.items.length) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  public handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    this.hoverStateChange.emit(false);
  }

  public handleDrop(e: DragEvent) {
    e.preventDefault();
    this.hoverStateChange.emit(false);
    if (e.dataTransfer) {
      this.fileUploaded.emit(e.dataTransfer.files);
    }
  }
}
