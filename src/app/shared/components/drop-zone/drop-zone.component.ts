import {Component, ElementRef, output, signal, viewChild, ChangeDetectionStrategy} from '@angular/core';

import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FileUploadRestrictionsConfig} from '../../configs/file-upload-restrictions.config';
import {FileValidationError} from '../../errors/file-upload.errors';
import {validateUploadedFileList} from '../../utils/validate-uploaded-file-list.utils';
import {AbstractDropzoneInteractionComponent} from '../abstract-dropzone-interaction/abstract-dropzone-interaction.component';

/**
 * This component only handles the file upload into a File object; it does _NOT_ handle the actual upload to the server.
 */
@Component({
  selector: 'drop-zone',
  imports: [MatButton, MatIcon],
  templateUrl: './drop-zone.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent extends AbstractDropzoneInteractionComponent {
  public readonly addedFileEvent = output<Blob | File>();
  public readonly uploadErrorEvent = output<string>();
  public readonly fileUploadField = viewChild.required<ElementRef>('fileUploadField');
  public readonly acceptedFileTypes = FileUploadRestrictionsConfig.allowedFileTypes.join(', ');

  protected inputValueChange() {
    const files = this.fileUploadField().nativeElement.files;
    if (files !== null) {
      this.handleFileUpload(files);
    }
  }

  public handleFileUpload(files: FileList) {
    try {
      validateUploadedFileList(files);
      this.addedFileEvent.emit(files[0]);
    } catch (e) {
      this.uploadErrorEvent.emit((e as FileValidationError).message);
      this.isHovered.set(false);
    }
  }
}
