import {Pipe, PipeTransform, inject} from '@angular/core';
import {BasemapConfigService} from 'src/app/map/services/basemap-config.service';

@Pipe({name: 'basemapImageLink'})
export class BasemapImageLinkPipe implements PipeTransform {
  private readonly basemapConfigService = inject(BasemapConfigService);

  public transform(identifier: string | undefined): string {
    let imagePath = '';
    if (identifier === undefined) {
      return imagePath;
    }

    const basemap = this.basemapConfigService.availableBasemaps.find((availableBasemap) => availableBasemap.id === identifier);
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
