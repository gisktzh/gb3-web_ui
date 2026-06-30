import CIMSymbol, {CIMSymbolProperties} from '@arcgis/core/symbols/CIMSymbol';
import {EsriDrawingSymbolDefinition} from './esri-drawing-symbol-definition';
import {applyCIMSymbolRotation, scaleCIMSymbolTo} from '@arcgis/core/symbols/support/cimSymbolUtils';
import WebStyleSymbol, {WebStyleSymbolProperties} from '@arcgis/core/symbols/WebStyleSymbol';

const webStyleJson: WebStyleSymbolProperties = {
  name: 'Yes',
  styleName: 'Style name',
  styleUrl: 'https://www.example.com/some_collection_id',
};

const cimJson: CIMSymbolProperties = {
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      scaleX: 12,
    },
  },
};

describe('EsriDrawingSymbolDefinition', () => {
  it('should fetch a CIM symbol correctly and transform it into an EsriDrawingSymbolDescriptor', async () => {
    const esriDrawingSymbolDefiniton = new EsriDrawingSymbolDefinition(webStyleJson);

    const cimSymbol = new CIMSymbol(cimJson);

    // Method comes from WebStyleSymbol
    const fetchSymbolSpy = vi.spyOn(esriDrawingSymbolDefiniton, 'fetchSymbol').mockResolvedValue(cimSymbol);

    const esriDrawingSymbolDescriptor = await esriDrawingSymbolDefiniton.fetchDrawingSymbolDescriptor();

    expect(esriDrawingSymbolDescriptor.toJSON()).toEqual(cimSymbol.toJSON());
    expect(fetchSymbolSpy).toHaveBeenCalledWith({acceptedFormats: ['cim']});
  });

  it('should fetch a CIM symbol correctly and transform it into an EsriDrawingSymbolDescriptor and resize and rotate', async () => {
    const esriDrawingSymbolDefiniton = new EsriDrawingSymbolDefinition(webStyleJson);

    const cimSymbol = new CIMSymbol(cimJson);

    // Method comes from WebStyleSymbol
    vi.spyOn(esriDrawingSymbolDefiniton, 'fetchSymbol').mockResolvedValue(cimSymbol);

    const esriDrawingSymbolDescriptor = await esriDrawingSymbolDefiniton.fetchDrawingSymbolDescriptor(10, 20);

    expect(scaleCIMSymbolTo).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 10);
    expect(applyCIMSymbolRotation).toHaveBeenCalledWith(esriDrawingSymbolDescriptor, 20);
  });

  it('should set itself up from JSON properly', () => {
    const expected = new WebStyleSymbol(webStyleJson);

    const actual = EsriDrawingSymbolDefinition.fromJSON(webStyleJson);

    expect(expected.toJSON()).toEqual(actual.toJSON());
  });

  it('should determine if it belongs to a given collection correctly', () => {
    const esriDrawingSymbolDefiniton = new EsriDrawingSymbolDefinition(webStyleJson);

    expect(esriDrawingSymbolDefiniton.belongsToCollection('asdf')).toBe(false);
    expect(esriDrawingSymbolDefiniton.belongsToCollection('some_collection_id')).toBe(true);
  });
});
