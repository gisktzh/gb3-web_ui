import {Component, ElementRef, output, signal, viewChild} from '@angular/core';

import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FileUploadRestrictionsConfig} from '../../configs/file-upload-restrictions.config';
import {FileValidationError} from '../../errors/file-upload.errors';
import {validateUploadedFileList} from '../../utils/validate-uploaded-file-list.utils';

/**
 * This component only handles the file upload into a File object; it does _NOT_ handle the actual upload to the server.
 */
@Component({
  selector: 'drop-zone',
  imports: [MatButton, MatIcon],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent {
  public readonly addedFileEvent = output<Blob | File>();
  public readonly uploadErrorEvent = output<string>();
  public readonly fileUploadField = viewChild.required<ElementRef>('fileUploadField');
  public readonly acceptedFileTypes = FileUploadRestrictionsConfig.allowedFileTypes.join(', ');
  protected readonly isHovered = signal(false);

  protected handleDragOver(e: DragEvent) {
    e.stopPropagation();
    this.isHovered.set(true);

    if (e.dataTransfer?.items.length) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    this.isHovered.set(false);
  }

  protected handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      this.handleFileUpload(e.dataTransfer.files);
    }
  }

  protected inputValueChange() {
    const files = this.fileUploadField().nativeElement.files;
    if (files !== null) {
      this.handleFileUpload(files);
    }
  }

  private handleFileUpload(files: FileList) {
    try {
      validateUploadedFileList(files);
      this.addedFileEvent.emit(files[0]);
    } catch (e) {
      this.uploadErrorEvent.emit((e as FileValidationError).message);
      this.isHovered.set(false);
    }
  }
}
