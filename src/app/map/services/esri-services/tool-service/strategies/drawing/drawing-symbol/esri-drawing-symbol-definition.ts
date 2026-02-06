import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {EsriDrawingSymbolDescriptor} from './esri-drawing-symbol-descriptor';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {subclass} from '@arcgis/core/core/accessorSupport/decorators';

// Esri being Esri - this is @subclass decorator necessary because of the way subclassing is implemented by @arcgis/core.
// See https://developers.arcgis.com/javascript/latest/implementing-accessor/#create-a-simple-subclass
@subclass('EsriDrawingSymbolDefinition')
export class EsriDrawingSymbolDefinition extends WebStyleSymbol implements DrawingSymbolDefinition {
  public size: number = -1;
  public rotation: number = -1;

  constructor(properties?: __esri.WebStyleSymbolProperties) {
    super(properties);
  }

  public async fetchDrawingSymbolDescriptor(size?: number, rotation?: number): Promise<EsriDrawingSymbolDescriptor> {
    const cimSymbol = (await this.fetchSymbol({acceptedFormats: ['cim']})) as CIMSymbol;

    const esriDrawingSymbolDescriptor = EsriDrawingSymbolDescriptor.fromCIMSymbol(cimSymbol);

    if (size) {
      esriDrawingSymbolDescriptor.resize(size);
    }

    if (rotation) {
      esriDrawingSymbolDescriptor.rotate(rotation);
    }

    return esriDrawingSymbolDescriptor;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- to keep the method signature equal to the one of the super class.
  public static override fromJSON(json: any): EsriDrawingSymbolDefinition {
    // This is, again, due to the way @arcgis/core handles classes in a deprecated way.
    const webStyleSymbol = super.fromJSON(json);
    const usableJson = webStyleSymbol.toJSON();
    delete usableJson.type;
    const esriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition(usableJson);

    return esriDrawingSymbolDefinition;
  }

  public belongsToCollection(id: string): boolean {
    return !!this.styleUrl?.includes(id);
  }
}
