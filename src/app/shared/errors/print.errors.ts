import {RecoverableError} from './abstract.errors';

export class PrintInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Druckoptionen konnten nicht geladen werden.';
  public override name = 'PrintInfoCouldNotBeLoaded';
}

export class PrintRequestCouldNotBeHandled extends RecoverableError {
  public override message = 'Beim Drucken ist etwas schief gelaufen.';
  public override name = 'PrintRequestCouldNotBeHandled';
}
