import {RecoverableError} from './abstract.errors';

export class DrawingNotFound extends RecoverableError {
  public override message = 'Die gewählte Zeichnung wurde nicht gefunden.';
  public override name = 'DrawingNotFound';
}
