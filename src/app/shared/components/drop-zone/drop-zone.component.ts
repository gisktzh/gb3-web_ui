import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import Uppy from '@uppy/core';
import DropTarget from '@uppy/drop-target';
import FileInput from '@uppy/file-input';
import {NgClass} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FileUploadRestrictionsConfig} from '../../configs/file-upload-restrictions.config';

/**
 * This component only handles the file upload into a File object; it does _NOT_ handle the actual upload to the server.
 */
@Component({
  selector: 'drop-zone',
  imports: [NgClass, MatButton, MatIcon],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent implements AfterViewInit {
  @Output() public readonly addedFileEvent = new EventEmitter<Blob | File>();
  @Output() public readonly uploadErrorEvent = new EventEmitter<string>();
  public acceptedFileTypes = FileUploadRestrictionsConfig.allowedFileTypes!.join(', ');
  protected isHovered = false;
  private readonly uppyInstance = new Uppy({
    restrictions: FileUploadRestrictionsConfig,
  });
  @ViewChild('dropBoxContainer') private dropBoxContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  public ngAfterViewInit() {
    this.uppyInstance
      .use(DropTarget, {
        target: this.dropBoxContainer.nativeElement,
        onDragOver: () => {
          this.isHovered = true;
        },
        onDragLeave: () => {
          this.isHovered = false;
        },
        onDrop: () => {
          this.isHovered = false;
        },
      })
      .use(FileInput, {target: this.fileInput.nativeElement})
      .on('file-added', (data) => {
        this.addedFileEvent.emit(data.data);
        this.uppyInstance.removeFile(data.id); // needed as long as only 1 file can be uploaded
      })
      .on('restriction-failed', (file, error) => {
        this.uploadErrorEvent.emit(error.message);
        this.fileInput.nativeElement.value = '';
      })
      .on('error', (error) => {
        this.uploadErrorEvent.emit(error.message);
      });

    const fileInput = this.fileInput.nativeElement;
    fileInput.addEventListener('change', () => {
      const files = fileInput.files?.length ? Array.from(fileInput.files) : [];

      files.forEach((file) => {
        try {
          this.uppyInstance.addFile({
            source: 'file input',
            name: file.name,
            type: file.type,
            data: file,
          });
        } catch (err) {
          // We only throw an error if the file size does not exceed the maximum, because this case is already handled by Uppy.
          // Otherwise, we would throw two errors for the same cause. This can only happen when the user uploads a large file from the file-input, not via drag-and-drop
          if (file.size < FileUploadRestrictionsConfig.maxFileSize!) {
            this.uploadErrorEvent.emit('Ein unerwarteter Fehler ist aufgetreten.');
          }
        }
      });
    });
  }
}
