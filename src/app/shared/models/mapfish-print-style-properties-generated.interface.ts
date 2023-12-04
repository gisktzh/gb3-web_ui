/**
 * Taken from https://mapfish.github.io/mapfish-print-doc/styles.html#stylev1
 *
 * Note that types are all over the place, so you cannot rely on a size property to be an actual number.
 */
export interface MapfishPrintStyleProperties {
  fillColor: string;
  fillOpacity: number;
  rotation: string;
  externalGraphic: string;
  graphicName: string;
  graphicOpacity: number;
  pointRadius: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  strokeLinecap: string;
  strokeLinejoin: string;
  strokeDashstyle: string;
  fontColor: string;
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  haloColor: string;
  haloOpacity: string;
  haloRadius: string;
  label: string;
  labelAlign: string;
  labelRotation: string;
  labelXOffset: string;
  labelYOffset: string;
}
