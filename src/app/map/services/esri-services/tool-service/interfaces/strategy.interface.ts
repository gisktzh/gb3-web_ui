export interface EsriToolStrategy {
  start: (finalizeCallback: () => void) => void;
  end: () => void;
}
