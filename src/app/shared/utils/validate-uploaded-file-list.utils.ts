import {FileUploadRestrictionsConfig} from '../configs/file-upload-restrictions.config';
import {FileSizeTooLargeValidationError, InvalidFileTypeValidationError, TooManyFilesValidationError} from '../errors/file-upload.errors';

export function validateUploadedFileList(files: FileList) {
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
