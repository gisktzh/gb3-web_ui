import {FatalError, RecoverableError} from '../../../../error-handling/models/errors';

export class UnsupportedGeometryType extends RecoverableError {
  public override message = `Nicht unterstützter Geometrietyp (${this.geometryType})`;

  constructor(private readonly geometryType: string) {
    super();
  }
}

export class MapViewNotInitialized extends FatalError {
  public override message = 'Mapview ist nicht initialisiert.';
}
