import {FatalError, RecoverableError} from '../../../../shared/errors/abstract.errors';

export class UnsupportedGeometryType extends FatalError {
  public override message = `Nicht unterstützter Geometrietyp (${this.geometryType})`;

  constructor(private readonly geometryType: string) {
    super();
  }
}

export class UnsupportedLabelType extends FatalError {
  public override message = `Nicht unterstützter Labeltyp mit Geometrie ${this.geometryType}`;

  constructor(private readonly geometryType: string) {
    super();
  }
}

export class UnsupportedSymbolizationType extends RecoverableError {
  public override message = `Nicht unterstützter Symbolisierungstyp (${this.symbolizationType})`;

  constructor(private readonly symbolizationType: string) {
    super();
  }
}

export class MapViewNotInitialized extends FatalError {
  public override message = 'Es ist ein technischer Fehler während dem Initialisieren der Karte aufgetreten.';
}

export class DrawingLayerNotInitialized extends RecoverableError {
  public override message = 'Es ist ein technischer Fehler beim Hinzufügen der Grafiken aufgetreten.';
}
