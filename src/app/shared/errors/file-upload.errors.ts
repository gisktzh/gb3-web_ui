import {RecoverableError} from './abstract.errors';

export class FileValidationError extends RecoverableError {
  public override name = 'FileValidationError';
  constructor(message?: string) {
    super();
    if (message === 'You can only upload 1 file') {
      this.message = 'Es kann nur eine Datei hochgeladen werden';
    } else if (message?.startsWith('You can only upload:')) {
      this.message = 'Es können nur Dateien mit den Endungen .kml, .json oder .geojson hochgeladen werden.';
    } else {
      this.message = 'Bei der Filevalidierung ist etwas schief gelaufen.';
    }
  }
}

export class FileImportError extends RecoverableError {
  public override message = 'Beim Import der Datei ist ein Fehler aufgetreten.';
  public override name = 'FileImportError';
}
