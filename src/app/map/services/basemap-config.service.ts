import {Injectable, inject} from '@angular/core';
import {Basemap} from '../../shared/interfaces/basemap.interface';
import {ConfigService} from '../../shared/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class BasemapConfigService {
  private readonly configService = inject(ConfigService);

  private readonly _availableBasemaps: Basemap[] = this.configService.basemapConfig.availableBasemaps;
  private readonly defaultBasemap: Basemap = this.configService.basemapConfig.defaultBasemap;

  public get availableBasemaps(): Basemap[] {
    return this._availableBasemaps;
  }

  public checkBasemapIdOrGetDefault(id: string | undefined | null, initialMaps: string[] = []): string {
    const trimmedId = id?.trim();

    if (trimmedId) {
      const basemap = this.availableBasemaps.find((availableBasemap) => availableBasemap.id.toLowerCase() === trimmedId.toLowerCase());

      if (basemap) {
        return basemap.id;
      }
    }

    if (initialMaps.length > 0) {
      const normalizedInitialMaps = new Set(initialMaps.map((initialMap) => initialMap.trim().toLowerCase()));

      const defaultBasemapForInitialMaps = this.availableBasemaps.find((availableBasemap) =>
        availableBasemap.defaultForTopics?.some((defaultForTopic) => normalizedInitialMaps.has(defaultForTopic.trim().toLowerCase())),
      );

      if (defaultBasemapForInitialMaps) {
        return defaultBasemapForInitialMaps.id;
      }
    }

    return this.defaultBasemap.id;
  }
}
