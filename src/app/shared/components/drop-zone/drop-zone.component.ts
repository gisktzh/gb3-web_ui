import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgClass} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FileUploadRestrictionsConfig} from '../../configs/file-upload-restrictions.config';
import {
  FileSizeTooLargeValidationError,
  FileValidationError,
  InvalidFileTypeValidationError,
  TooManyFilesValidationError,
} from '../../errors/file-upload.errors';

/**
 * This component only handles the file upload into a File object; it does _NOT_ handle the actual upload to the server.
 */
@Component({
  selector: 'drop-zone',
  imports: [NgClass, MatButton, MatIcon],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent {
  @Output() public readonly addedFileEvent = new EventEmitter<Blob | File>();
  @Output() public readonly uploadErrorEvent = new EventEmitter<string>();
  @ViewChild('fileUploadField') public readonly fileUploadField!: ElementRef<HTMLInputElement>;
  public acceptedFileTypes = FileUploadRestrictionsConfig.allowedFileTypes.join(', ');
  protected isHovered = false;

  protected handleDragOver(e: DragEvent) {
    e.stopPropagation();
    this.isHovered = true;

    if (e.dataTransfer?.items.length) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    this.isHovered = false;
  }

  protected handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      this.handleFileUpload(e.dataTransfer.files);
    }
  }

  protected inputValueChange() {
    if (this.fileUploadField.nativeElement.files !== null) {
      this.handleFileUpload(this.fileUploadField.nativeElement.files);
    }
  }

  private handleFileUpload(files: FileList) {
    try {
      this.validateFile(files);
      this.addedFileEvent.emit(files[0]);
    } catch (e) {
      this.uploadErrorEvent.emit((e as FileValidationError).message);
      this.isHovered = false;
    }
  }

  private validateFile(files: FileList) {
    if (files.length !== 1) {
      throw new TooManyFilesValidationError();
    }

    const file = files[0];

    if (!FileUploadRestrictionsConfig.allowedFileTypes.some((ft) => file.name.toLowerCase().endsWith(ft.toLowerCase()))) {
      throw new InvalidFileTypeValidationError();
    }

    if (file.size > FileUploadRestrictionsConfig.maxFileSize) {
      throw new FileSizeTooLargeValidationError();
    }
  }
}
