import {RecoverableError} from './abstract.errors';

export class PrintInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Druckoptionen konnten nicht geladen werden.';
  public override name = 'PrintInfoCouldNotBeLoaded';
}

export type Gb3PrintErrorResponse = {
  error: {
    errors: string[];
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a type guard
function isErrorFromGb3(error: any): error is Gb3PrintErrorResponse {
  return typeof error !== 'string' && typeof error.error?.errors !== 'undefined';
}

export class PrintRequestCouldNotBeHandled extends RecoverableError {
  private readonly translatedErrorMessagePatterns = {
    '^Invalid report name$': 'Report-Name existiert nicht',
    '^Missing attributes$': 'Es fehlen Angaben',
    '^Invalid output format$': 'Das Ausgabe-Format existiert nicht',
    '^Invalid output format for show_legend=true$': 'Dieses Ausgabeformat kann keine Legenden anzeigen',
    '^Invalid output format for report (.*)$': 'Dieses Ausgabeformat existiert nicht für den Report $1',
    '^Missing map options$': 'Es fehlen Kartenoptionen',
    '^Invalid map center$': 'Ungültiger Kartenmittelpunkt',
    '^Invalid map scale$': 'Ungültiger Massstab',
    '^Invalid rotation$': 'Ungültiger Rotationsparameter',
    '^Invalid DPI$': 'Ungültiger DPI-Wert',
    '^Invalid DPI for report (.*)$': 'Ungültiger DPI-Wert für Report $1',
    '^Missing map layers$': 'Fehlende Karten-Layer',
    '^Invalid map layers$': 'Ungültige Karten-Layer',
    '^Invalid map layer #(.*)$': 'Ungültiger Karten-Layer #$1',
    '^Missing WMS URL in layer #(.*)$': 'WMS URL fehlt in Layer #$1',
    '^Missing WMS layers in layer #(.*)$': 'WMS-Layer fehlen in Layer #$1',
    '^Missing vector features in layer #(.*)$': 'Vektor-Features fehlen in Layer #$1',
    '^Missing vector styles in layer #(.*)$': 'Vektor-Styles fehlen in Layer #$1',
    '^Unsupported layer type in layer #(.*)$': 'Nicht-unterstützter Layer-Typ in Layer #$1',
    "^The response was: '(.*): Name or service not known'$": 'Map-Server ist nicht erreichbar',
    "^The response was: '(.*): No address associated with hostname'$": 'Map-Server ist nicht erreichbar',
    '^Failed to open TCP connection to (.*)$': 'Print-Server ist nicht erreichbar',
  };

  public override get message() {
    if (!isErrorFromGb3(this.originalError)) {
      return `Beim Drucken ist etwas schief gelaufen: ${this.originalError}`;
    }

    if (this.originalError === undefined) {
      return 'Beim Drucken ist etwas schief gelaufen';
    }

    const translationPatterns = Object.keys(this.translatedErrorMessagePatterns).map((p) => new RegExp(p));

    const translatedErrors = this.originalError.error.errors
      .filter((e) => translationPatterns.some((p) => p.exec(e)))
      .map((e) => {
        Object.entries(this.translatedErrorMessagePatterns).forEach(([pattern, translation]) => {
          const p = new RegExp(pattern);

          e = e.replace(p, translation);
        });

        return e;
      });

    return `Beim Drucken ist etwas schief gelaufen: ${translatedErrors.join('\n')}`;
  }

  public override name = 'PrintRequestCouldNotBeHandled';
}
