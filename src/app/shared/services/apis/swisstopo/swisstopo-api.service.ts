import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {ElevationProfileResponse, ElevationProfileSearchParams} from '../../../models/swisstopo-api.interface';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwisstopoApiService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.swisstopoRestApi.baseUrl;

  public loadElevationProfile(): Observable<ElevationProfileResponse> {
    const payload: ElevationProfileSearchParams = {
      geom: JSON.stringify({
        type: 'LineString',
        coordinates: [
          [2550050, 1206550],
          [2556950, 1204150],
          [2561050, 1207950],
        ],
      }),
      sr: '2056',
    };

    return this.post<URLSearchParams, ElevationProfileResponse>(this.createElevationProfileUrl(), new URLSearchParams(payload), {
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  }

  private createElevationProfileUrl(): string {
    return `${this.apiBaseUrl}/profile.json`;
  }
}
