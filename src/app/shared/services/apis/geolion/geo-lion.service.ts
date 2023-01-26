import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {environment} from '../../../../../environments/environment';
import {RootObject} from '../../../models/geolion-ogd4web-generated.interfaces';
import {GeoLionOgd4WebResponse} from '../../../interfaces/geolion-ogd4web.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoLionService extends BaseApiService {
  protected apiBaseUrl: string = environment.baseUrls.geoLion;
  private readonly ogd4zhwebEndpoint: string = 'api/v1/getOgd4zhweb.json';

  public async getOgd4zhwebData(): Promise<GeoLionOgd4WebResponse[]> {
    const requestUrl = this.getFullEndpointUrl(this.ogd4zhwebEndpoint);
    const results = await this.get<RootObject>(requestUrl);

    return results.dataset;
  }

  private getFullEndpointUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }
}
