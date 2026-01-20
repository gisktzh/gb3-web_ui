import {RecoverableError} from './abstract.errors';
import {FileUploadRestrictionsConfig} from '../configs/file-upload-restrictions.config';

const FILE_VALIDATION_ERRORS = {
  TOO_MANY_FILES: 'Es kann nur eine Datei hochgeladen werden.',
  INVALID_FILE_TYPE: `Es können nur Dateien mit den folgenden Endungen hochgeladen werden: ${FileUploadRestrictionsConfig.allowedFileTypes!.join(', ')}`,
  FILE_SIZE_TOO_LARGE: 'Die maximale Dateigröße beträgt 10 MB.',
  DEFAULT: 'Bei der Validierung der Datei ist etwas schief gelaufen.',
};

export class FileValidationError extends RecoverableError {
  public override name = 'FileValidationError';
  constructor(message?: string) {
    super();
    if (message === 'You can only upload 1 file') {
      this.message = FILE_VALIDATION_ERRORS.TOO_MANY_FILES;
    } else if (message?.startsWith('You can only upload:')) {
      this.message = FILE_VALIDATION_ERRORS.INVALID_FILE_TYPE;
    } else if (message?.includes('exceeds maximum allowed size of')) {
      this.message = FILE_VALIDATION_ERRORS.FILE_SIZE_TOO_LARGE;
    } else {
      this.message = FILE_VALIDATION_ERRORS.DEFAULT;
    }
  }
}

export class FileImportError extends RecoverableError {
  public override message = 'Beim Hochladen der Datei ist ein Fehler aufgetreten.';
  public override name = 'FileImportError';
}
