import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {EsriDrawingSymbolDescriptor} from './esri-drawing-symbol-descriptor';
import {applyCIMSymbolRotation, scaleCIMSymbolTo} from '@arcgis/core/symbols/support/cimSymbolUtils';
import cimSymbolToSVG from '@gisktzh/cim-symbol-to-svg';

const json: __esri.CIMSymbolProperties = {
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      scaleX: 12,
    },
  },
};

describe('EsriDrawingSymbolDescriptor', () => {
  let esriDrawingSymbolDescriptor: EsriDrawingSymbolDescriptor;

  it('should resize via esri utils', () => {
    esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.resize(123);

    expect(scaleCIMSymbolTo).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 123);
  });

  it('should rotate via esri utils', () => {
    esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.rotate(123);

    expect(applyCIMSymbolRotation).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 123);
  });

  it('should use the library function to convert a CIM symbol to SVG', () => {
    esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor();
    esriDrawingSymbolDescriptor.toSVG();

    expect(cimSymbolToSVG).toHaveBeenCalledWith(esriDrawingSymbolDescriptor);
  });

  it('should set itself up from an existing CIM symbol', () => {
    const cimSymbol = new CIMSymbol(json);

    esriDrawingSymbolDescriptor = EsriDrawingSymbolDescriptor.fromCIMSymbol(cimSymbol);

    const expectedJson = cimSymbol.toJSON();
    expect(esriDrawingSymbolDescriptor.toJSON()).toEqual(expectedJson);
  });

  it('should set itself up from JSON', () => {
    const cimSymbol = new CIMSymbol(json);

    esriDrawingSymbolDescriptor = EsriDrawingSymbolDescriptor.fromJSON(json);

    const expectedJson = cimSymbol.toJSON();
    expect(esriDrawingSymbolDescriptor.toJSON()).toEqual(expectedJson);
  });
});
