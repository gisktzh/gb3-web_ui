import {RecoverableError} from './abstract.errors';
import {FileUploadRestrictionsConfig} from '../configs/file-upload-restrictions.config';

export class FileValidationError extends RecoverableError {
  public override name = 'FileValidationError';
  public override message = 'Bei der Validierung der Datei ist etwas schief gelaufen.';
}

export class TooManyFilesValidationError extends FileValidationError {
  public override name = 'TooManyFilesImportError';
  public override message = 'Es kann nur eine Datei hochgeladen werden.';
}

export class InvalidFileTypeValidationError extends FileValidationError {
  public override name = 'InvalidFileTypeValidationError';
  public override message = `Es können nur Dateien mit den folgenden Endungen hochgeladen werden: ${FileUploadRestrictionsConfig.allowedFileTypes!.join(', ')}`;
}

export class FileSizeTooLargeValidationError extends FileValidationError {
  public override name = 'FileSizeTooLargeValidationError';
  public override message = 'Die maximale Dateigröße beträgt 10 MB.';
}

export class FileImportError extends RecoverableError {
  public override name = 'FileImportError';
  public override message = 'Beim Hochladen der Datei ist ein Fehler aufgetreten.';
}
