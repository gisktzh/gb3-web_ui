import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {environment} from '../../../../../environments/environment';
import {GeoLionGeodatenMetaInterface} from '../../../interfaces/geolion-geodaten-meta.interface';
import {RootObject as GeodatenMetaRootObject} from '../../../models/geolion-geodaten-meta-generated.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoLionService extends BaseApiService {
  protected apiBaseUrl: string = environment.baseUrls.geoLion;
  private readonly geodatenMetaEndpoint: string = 'api/v2/getGeodatenmeta.json';

  public async getGeodatenMetaData(id: string): Promise<GeoLionGeodatenMetaInterface> {
    const requestUrl = this.getFullEndpointUrl(this.geodatenMetaEndpoint, [{key: 'giszhnr', value: id}]);

    return await this.get<GeodatenMetaRootObject>(requestUrl);
  }

  private getFullEndpointUrl(endpoint: string, parameters: {key: string; value: string}[] = []): string {
    const url = new URL(`${this.apiBaseUrl}/${endpoint}`);

    if (parameters) {
      parameters.forEach(({key, value}) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }
}
