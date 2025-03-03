import {FatalError, RecoverableError, SilentError} from '../../../../shared/errors/abstract.errors';

export class UnsupportedGeometryType extends FatalError {
  public override message = `Nicht unterstützter Geometrietyp (${this.geometryType})`;

  constructor(private readonly geometryType: string) {
    super();
  }
}

export class GeometryMissing extends FatalError {
  public override message = `Objekt hat keine Geometrie`;
}

export class SymbolizationMissing extends FatalError {
  public override message = `Objekt hat keine Symbolisierung`;
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

export class LabelPositionCalculationFailed extends SilentError {
  public override message = `Konnte Label nicht positionieren. Grund: ${this.reason}`;

  constructor(private readonly reason: string) {
    super();
  }
}

export class EditFeatureInitializationFailed extends RecoverableError {
  public override message = 'Fehler beim Initialisieren des Editierens von Features. Grund: ${this.reason}';

  constructor(private readonly reason: string) {
    super();
  }
}

export class ZoomExtentMissing extends RecoverableError {
  public override message = 'Konnte nicht zum Objekt zoomen, da dessen Ausdehnung nicht ermittelt werden konnte.';
}

export class SRSMissing extends RecoverableError {
  public override message = 'Das Koordinatensystem fehlt.';
}
