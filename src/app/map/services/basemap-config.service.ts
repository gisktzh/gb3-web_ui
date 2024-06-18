import {Injectable} from '@angular/core';
import {Basemap} from '../../shared/interfaces/basemap.interface';
import {ConfigService} from '../../shared/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class BasemapConfigService {
  private readonly _availableBasemaps: Basemap[] = this.configService.basemapConfig.availableBasemaps;
  private readonly defaultBasemap: Basemap = this.configService.basemapConfig.defaultBasemap;

  constructor(private readonly configService: ConfigService) {}

  public get availableBasemaps(): Basemap[] {
    return this._availableBasemaps;
  }

  public checkBasemapIdOrGetDefault(id: string | undefined | null): string {
    if (id === undefined || id === null) {
      return this.defaultBasemap.id;
    }

    id = id.trim();
    if (id === '') {
      return this.defaultBasemap.id;
    }

    const basemap = this.availableBasemaps.find((availableBasemap) => availableBasemap.id.toLowerCase() === id!.toLowerCase());
    if (basemap) {
      return basemap.id;
    }

    return this.defaultBasemap.id;
  }
}
