import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {ElevationProfileResponse, ElevationProfileSearchParams} from '../../../models/swisstopo-api.interface';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ElevationProfileData} from '../../../interfaces/elevation-profile.interface';
import {Geometry} from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class SwisstopoApiService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.swisstopoRestApi.baseUrl;

  public loadElevationProfile(geometry: Geometry): Observable<ElevationProfileData> {
    const payload: ElevationProfileSearchParams = {
      geom: JSON.stringify(geometry),
      sr: '2056',
    };

    return this.post<URLSearchParams, ElevationProfileResponse[]>(this.createElevationProfileUrl(), new URLSearchParams(payload), {
      'Content-Type': 'application/x-www-form-urlencoded',
    }).pipe(
      map((value) => {
        return value.reduce<ElevationProfileData>(
          (prev, curr) => {
            prev.maxDistance = curr.dist;
            prev.dataPoints.push({altitude: curr.alts.COMB, distance: curr.dist});
            return prev;
          },
          {maxDistance: 0, dataPoints: []},
        );
      }),
    );
  }

  private createElevationProfileUrl(): string {
    return `${this.apiBaseUrl}/profile.json`;
  }
}
