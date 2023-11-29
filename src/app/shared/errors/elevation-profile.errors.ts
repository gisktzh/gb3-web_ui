import {RecoverableError} from './abstract.errors';

export class ElevationProfileCouldNotBeLoaded extends RecoverableError {
  public override message = 'Höhenprofil konnte nicht erstellt werden.';
  public override name = 'ElevationProfileCouldNotBeLoaded';
}
