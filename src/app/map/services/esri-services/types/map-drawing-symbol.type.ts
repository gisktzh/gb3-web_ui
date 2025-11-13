import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';

export type MapDrawingSymbol = {
  webStyleSymbol?: WebStyleSymbol;
  cimSymbol?: CIMSymbol;
};
