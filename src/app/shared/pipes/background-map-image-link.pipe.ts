import {Pipe, PipeTransform} from '@angular/core';
import {ConfigService} from '../services/config.service';

@Pipe({
  name: 'basemapImageLink'
})
export class BasemapImageLinkPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}
  public transform(identifier: string): string {
    const image = this.configService.basemapConfig.availableBasemaps.find((availableBasemap) => availableBasemap.id === identifier);
    return image?.relativeImagePath ?? '';
  }
}
