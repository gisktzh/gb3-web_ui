import {Pipe, PipeTransform} from '@angular/core';
import {MapLayer} from '../interfaces/topic.interface';

@Pipe({name: 'layerTooltip'})
export class LayerTooltipPipe implements PipeTransform {
  public transform(layer: MapLayer): unknown {
    return `${layer.title} (Sichtbarkeit 1:${layer.minScale} - 1:${layer.maxScale})`;
  }
}
