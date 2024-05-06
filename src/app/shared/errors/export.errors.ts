import {RecoverableError} from './abstract.errors';

export class DrawingCouldNotBeExported extends RecoverableError {
  public override message = 'Beim Daten-Export ist etwas schief gelaufen.';
  public override name = 'PrintRequestCouldNotBeHandled';
}
