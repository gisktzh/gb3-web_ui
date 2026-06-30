import CIMSymbol, {CIMSymbolProperties} from '@arcgis/core/symbols/CIMSymbol';
import {applyCIMSymbolRotation, scaleCIMSymbolTo} from '@arcgis/core/symbols/support/cimSymbolUtils';
import cimSymbolToSVG from '@gisktzh/cim-symbol-to-svg';
import {EsriDrawingSymbolDescriptor} from './esri-drawing-symbol-descriptor';

const json: CIMSymbolProperties = {
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      scaleX: 12,
    },
  },
};

describe('EsriDrawingSymbolDescriptor', () => {
  it('should resize via esri utils', () => {
    const esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.resize(123);

    expect(scaleCIMSymbolTo).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 123);
  });

  it('should rotate via esri utils', () => {
    const esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.rotate(123);

    expect(applyCIMSymbolRotation).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 123);
  });

  it('should use the library function to convert a CIM symbol to SVG', () => {
    const esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.toSVG();

    expect(cimSymbolToSVG).toHaveBeenCalledWith(esriDrawingSymbolDescriptor);
  });

  it('should set itself up from an existing CIM symbol', () => {
    const cimSymbol = new CIMSymbol(json);
    const esriDrawingSymbolDescriptor = EsriDrawingSymbolDescriptor.fromCIMSymbol(cimSymbol);

    const expectedJson = cimSymbol.toJSON();
    expect(esriDrawingSymbolDescriptor.toJSON()).toEqual(expectedJson);
  });

  it('should set itself up from JSON', () => {
    const cimSymbol = new CIMSymbol(json);
    const esriDrawingSymbolDescriptor = EsriDrawingSymbolDescriptor.fromJSON(json);

    const expectedJson = cimSymbol.toJSON();
    expect(esriDrawingSymbolDescriptor.toJSON()).toEqual(expectedJson);
  });
});
