import {FatalError, RecoverableError} from '../../../../shared/errors/abstract.errors';

export class UnsupportedGeometryType extends RecoverableError {
  public override message = `Nicht unterstützter Geometrietyp (${this.geometryType})`;

  constructor(private readonly geometryType: string) {
    super();
  }
}

export class MapViewNotInitialized extends FatalError {
  public override message = 'Es ist ein technischer Fehler während dem Initialisieren der Karte aufgetreten.';
}
