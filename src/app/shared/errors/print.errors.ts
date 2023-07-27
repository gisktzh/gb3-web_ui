import {RecoverableError} from './abstract.errors';

export class PrintInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Druckoptionen konnten nicht geladen werden.';
}

export class PrintRequestCouldNotBeHandled extends RecoverableError {
  public override message = 'Beim Drucken ist etwas schief gelaufen.';
}
