import {FatalError, RecoverableError, SilentError} from '../../../../shared/errors/abstract.errors';

export class UnsupportedGeometryType extends FatalError {
  public override message = `Nicht unterstützter Geometrietyp (${this.geometryType})`;

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

export class LayerCouldNotBeLoaded extends RecoverableError {
  public override name = 'LayerCouldNotBeLoaded';

  constructor(reason?: string) {
    super();
    let message = 'Es ist ein technischer Fehler beim Laden eines Dienstes aufgetreten.';
    if (reason) {
      message += `\nDetails: '${reason}'`;
    }
    this.message = message;
  }
}

export class NonEditableLayerType extends SilentError {
  public override message = 'Dieser Layer kann nicht bearbeitet werden.';
}
