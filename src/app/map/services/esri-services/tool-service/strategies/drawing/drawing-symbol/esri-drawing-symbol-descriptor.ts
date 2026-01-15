import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {applyCIMSymbolRotation, scaleCIMSymbolTo} from '@arcgis/core/symbols/support/cimSymbolUtils';
import {DrawingSymbolDescriptor} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import {subclass} from '@arcgis/core/core/accessorSupport/decorators';
import cimSymbolToSVG from '@gisktzh/cim-symbol-to-svg';

// Esri being Esri - this is @subclass decorator necessary because of the way subclassing is implemented by @arcgis/core.
// See https://developers.arcgis.com/javascript/latest/implementing-accessor/#create-a-simple-subclass
@subclass('EsriDrawingSymbolDescriptor')
export class EsriDrawingSymbolDescriptor extends CIMSymbol implements DrawingSymbolDescriptor {
  constructor(properties?: __esri.CIMSymbolProperties) {
    super(properties);
  }

  public toSVG(): SVGElement | undefined {
    return cimSymbolToSVG(this);
  }

  public resize(size: number): void {
    scaleCIMSymbolTo(this, size);
  }

  public rotate(angle: number): void {
    applyCIMSymbolRotation(this, angle);
  }

  public static fromCIMSymbol(cimSymbol: CIMSymbol): EsriDrawingSymbolDescriptor {
    // This is, again, due to the way @arcgis/core handles classes in a deprecated way.
    const json = cimSymbol.toJSON();
    delete json.type;
    const esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor(json);

    // This doesn't happen when one instantiates it.
    esriDrawingSymbolDescriptor.data = cimSymbol.data;

    return esriDrawingSymbolDescriptor;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- to keep the method signature equal to the one of the super class.
  public static override fromJSON(json: any): EsriDrawingSymbolDescriptor {
    // This is, again, due to the way @arcgis/core handles classes in a deprecated way.
    const webStyleSymbol = super.fromJSON(json);
    const usableJson = webStyleSymbol.toJSON();
    delete usableJson.type;
    const esriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor(usableJson);

    return esriDrawingSymbolDescriptor;
  }
}
