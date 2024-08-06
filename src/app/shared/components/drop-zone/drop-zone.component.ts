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
  standalone: true,
  imports: [NgClass, MatButton, MatIcon],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent implements AfterViewInit {
  @Output() public addedFile = new EventEmitter<Blob | File>();
  @Output() public uploadError = new EventEmitter<string>();
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
      .use(FileInput, {target: '#file-input'})
      .on('file-added', (data) => {
        this.addedFile.emit(data.data);
        this.uppyInstance.removeFile(data.id); // needed as long as only 1 file can be uploaded
      })
      .on('restriction-failed', (file, error) => {
        this.uploadError.emit(error.message);
      })
      .on('error', (error) => {
        this.uploadError.emit(error.message);
      });

    const fileInput: HTMLInputElement = this.fileInput.nativeElement;
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
          this.uploadError.emit('Ein unerwarteter Fehler ist aufgetreten.');
        }
      });
    });
  }
}
