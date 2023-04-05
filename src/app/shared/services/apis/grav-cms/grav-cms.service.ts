import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {environment} from '../../../../../environments/environment';
import {Observable} from 'rxjs';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps.interface';
import {map} from 'rxjs/operators';
import {GravCmsRootObject, Map} from '../../../models/grav-cms-generated.interface';

@Injectable({
  providedIn: 'root'
})
export class GravCmsService extends BaseApiService {
  protected apiBaseUrl: string = environment.apiConfigs.gravCms.baseUrl;
  private readonly discoverMapsEndpoint: string = 'discovermaps.json';

  public loadDiscoverMapsData(): Observable<DiscoverMapsItem[]> {
    const requestUrl = this.createFullEndpointUrl(this.discoverMapsEndpoint);
    return this.get<GravCmsRootObject>(requestUrl).pipe(map((response) => this.transformDiscoverMapsData(response)));
  }

  private transformDiscoverMapsData(rootObject: GravCmsRootObject): DiscoverMapsItem[] {
    return rootObject['discover-maps'].map((discoverMapData: Map) => {
      return {
        ...discoverMapData,
        mapId: discoverMapData.id,
        fromDate: discoverMapData.from_date,
        toDate: discoverMapData.to_date,
        image: {
          ...discoverMapData.image,
          url: this.createFullImageUrl(discoverMapData.image.path)
        }
      };
    });
  }

  private createFullImageUrl(imagePath: string): string {
    const url = new URL(`${this.apiBaseUrl}/${imagePath}`);
    return url.toString();
  }

  private createFullEndpointUrl(endpoint: string, parameters: {key: string; value: string}[] = []): string {
    const url = new URL(`${this.apiBaseUrl}/${endpoint}`);

    if (parameters) {
      parameters.forEach(({key, value}) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }
}
