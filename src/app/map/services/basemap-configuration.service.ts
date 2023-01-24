import {Injectable} from '@angular/core';
import {Basemap} from '../../shared/interfaces/background-map.interface';
import {defaultBasemap, defaultBasemaps} from '../../shared/configs/base-map-config';

@Injectable({
  providedIn: 'root'
})
export class BasemapConfigurationService {
  private readonly _availableBasemaps: Basemap[] = defaultBasemaps;
  private readonly defaultBasemap: Basemap = defaultBasemap;

  public get availableBasemaps(): Basemap[] {
    return this._availableBasemaps;
  }

  public checkBasemapIdOrGetDefault(id: string | undefined): string {
    if (id === undefined || id === null || id === '') {
      return this.defaultBasemap.id;
    }

    id = id.toLowerCase();

    if (this.availableBasemaps.some((availableBasemap) => availableBasemap.id === id)) {
      return id;
    }

    return this.defaultBasemap.id;
  }
}
