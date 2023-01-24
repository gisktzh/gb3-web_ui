import {Injectable} from '@angular/core';
import {Basemap} from '../interfaces/background-map.interface';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map-config';

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

    if (this.availableBasemaps.some((availableBasemap) => availableBasemap.id === id)) {
      return id;
    }

    return this.defaultBasemap.id;
  }
}
