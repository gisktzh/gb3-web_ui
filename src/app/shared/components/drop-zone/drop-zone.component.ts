import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import Uppy from '@uppy/core';
import DropTarget from '@uppy/drop-target';
import FileInput from '@uppy/file-input';
import {NgClass} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

/**
 * This component only handles the file upload into a File object; it does _NOT_ handle the actual upload to the server.
 * Todo: We need to clear the internal store in case of errors
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
  @Output() public error = new EventEmitter<string>();
  protected isHovered = false;
  private readonly uppyInstance = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      maxFileSize: 10000000,
      allowedFileTypes: ['.kml', '.json', '.geojson'],
      // todo lme: use allowed filetypes
    },
  });
  @ViewChild('dropBoxContainer') private dropBoxContainer!: ElementRef<HTMLDivElement>;

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
      .use(FileInput, {target: '#file-input'}) // todo lme: maybe replace with https://uppy.io/docs/file-input/#custom-file-inpt for styles
      .on('file-added', (data) => {
        this.addedFile.emit(data.data);
        this.uppyInstance.removeFile(data.id); // needed as long as only 1 file can be uploaded
      })
      .on('restriction-failed', (file, error) => {
        this.error.emit(error.message);
      })
      .on('error', (error) => {
        this.error.emit(error.message);
      })
      .on('file-removed', (file) => {});
    // todo lme: do we need more events? note: upload stuff is not needed here

    const fileInput: HTMLInputElement = document.querySelector('#file-input')!;

    fileInput.addEventListener('change', (event) => {
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
          // handle other errors
          console.error(err);
        }
      });
    });
  }

  public openFileDialog() {
    const fileInput: HTMLInputElement = document.querySelector('#file-input')!;
    fileInput.click();
  }
}
