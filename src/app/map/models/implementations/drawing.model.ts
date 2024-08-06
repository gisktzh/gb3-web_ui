import {AbstractActiveMapItemSettings, ActiveMapItem} from '../active-map-item.model';
import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';
import {DrawingLayer, DrawingLayerPrefix, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

export class DrawingLayerSettings extends AbstractActiveMapItemSettings {
  public readonly type = 'drawing';
  public readonly userDrawingLayer: UserDrawingLayer;

  constructor(userDrawingLayer: UserDrawingLayer) {
    super();
    this.userDrawingLayer = userDrawingLayer;
  }
}

export class DrawingActiveMapItem extends ActiveMapItem {
  public readonly settings: DrawingLayerSettings;
  public readonly id: string;
  public readonly mapImageUrl = null;
  public readonly title: string;
  public readonly isSingleLayer: boolean = true;
  public readonly geometadataUuid = null;

  constructor(title: string, prefix: DrawingLayerPrefix, userDrawingLayer: UserDrawingLayer, visible?: boolean, opacity?: number) {
    super(visible, opacity);

    this.id = DrawingActiveMapItem.getFullLayerIdentifier(prefix, userDrawingLayer);
    this.title = title;
    this.settings = new DrawingLayerSettings(userDrawingLayer);
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addDrawingLayer(this, position);
  }

  public static getFullLayerIdentifier(prefix: DrawingLayerPrefix, id: DrawingLayer): string {
    return prefix + id;
  }
}
