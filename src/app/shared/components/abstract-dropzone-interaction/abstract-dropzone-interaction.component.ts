import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '',
})
export abstract class AbstractDropzoneInteractionComponent {
  public readonly isHovered = signal(false);

  public handleDragOver(e: DragEvent) {
    e.stopPropagation();
    this.isHovered.set(true);

    if (e.dataTransfer?.items.length) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  public handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    this.isHovered.set(false);
  }

  public handleDrop(e: DragEvent) {
    e.preventDefault();
    this.isHovered.set(false);
    if (e.dataTransfer) {
      this.handleFileUpload(e.dataTransfer.files);
    }
  }

  public abstract handleFileUpload(files: FileList): void;
}
