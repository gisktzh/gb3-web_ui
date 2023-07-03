import {AbstractActiveMapItemSettings, ActiveMapItem} from '../active-map-item.model';
import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

export class DrawingLayerSettings extends AbstractActiveMapItemSettings {
  public readonly type = 'drawing';
}

export class DrawingActiveMapItem extends ActiveMapItem {
  public readonly settings: DrawingLayerSettings;
  public readonly id: string;
  public readonly mapImageUrl = null;
  public readonly title: string;
  public readonly isSingleLayer: boolean = true;

  constructor(visible?: boolean, opacity?: number) {
    super(visible, opacity);

    this.id = UserDrawingLayer.Measurements;
    this.title = 'Messungen';
    this.settings = new DrawingLayerSettings();
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addDrawingLayer(this, position);
  }
}
