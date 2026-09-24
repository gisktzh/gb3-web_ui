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

  public checkBasemapIdOrGetDefault(id: string | undefined | null, topicIds: string[] = []): string {
    const trimmedId = id?.trim();

    if (trimmedId) {
      const basemap = this.availableBasemaps.find((availableBasemap) => availableBasemap.id.toLowerCase() === trimmedId.toLowerCase());

      if (basemap) {
        return basemap.id;
      }
    }

    if (topicIds.length > 0) {
      const normalizedTopicIds = new Set(topicIds.map((topicId) => topicId.trim().toLowerCase()));

      const defaultBasemapForTopics = this.availableBasemaps.find((availableBasemap) =>
        availableBasemap.defaultForTopics?.some((defaultForTopic) => normalizedTopicIds.has(defaultForTopic.trim().toLowerCase())),
      );

      if (defaultBasemapForTopics) {
        return defaultBasemapForTopics.id;
      }
    }

    return this.defaultBasemap.id;
  }
}
