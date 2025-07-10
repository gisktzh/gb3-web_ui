import {Pipe, PipeTransform, inject} from '@angular/core';
import {ConfigService} from '../services/config.service';

@Pipe({
  name: 'basemapImageLink',
  standalone: false,
})
export class BasemapImageLinkPipe implements PipeTransform {
  private readonly configService = inject(ConfigService);

  public transform(identifier: string | undefined): string {
    let imagePath = '';
    if (identifier === undefined) {
      return imagePath;
    }

    const basemap = this.configService.basemapConfig.availableBasemaps.find((availableBasemap) => availableBasemap.id === identifier);
    if (basemap) {
      switch (basemap.type) {
        case 'blank':
          // a blank basemap has no image path
          break;
        case 'wms':
          imagePath = basemap.relativeImagePath ?? '';
          break;
      }
    }
    return imagePath;
  }
}
