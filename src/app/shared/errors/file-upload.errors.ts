import {RecoverableError} from './abstract.errors';

export class FileValidationError extends RecoverableError {
  public override message = 'Bei der Filevalidierung ist etwas schief gelaufen.';
  public override name = 'FileValidationError';
}
