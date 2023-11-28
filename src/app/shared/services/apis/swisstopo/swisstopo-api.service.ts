import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {
  ElevationProfileAltitude,
  ElevationProfileResponse,
  ElevationProfileSearchParams,
} from '../../../models/swisstopo-api-generated.interface';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ElevationProfileData} from '../../../interfaces/elevation-profile.interface';
import {Geometry} from 'geojson';

/**
 * Defines which of the available elevation model data we're using.
 */
export const ELEVATION_MODEL: keyof ElevationProfileAltitude = 'COMB';

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
    }).pipe(map((value) => this.mapElevationProfileResponseToElevationProfileData(value)));
  }

  private mapElevationProfileResponseToElevationProfileData(response: ElevationProfileResponse[]): ElevationProfileData {
    return response.reduce<ElevationProfileData>(
      (acc, currentPoint, idx, data) => {
        acc.statistics.linearDistance = currentPoint.dist;
        acc.statistics.highestPoint =
          currentPoint.alts[ELEVATION_MODEL] > acc.statistics.highestPoint
            ? currentPoint.alts[ELEVATION_MODEL]
            : acc.statistics.highestPoint;
        acc.statistics.lowestPoint =
          currentPoint.alts[ELEVATION_MODEL] < acc.statistics.lowestPoint || idx === 0
            ? currentPoint.alts[ELEVATION_MODEL]
            : acc.statistics.lowestPoint;

        // only calculate slope distance / elevation difference if we're not on the first element
        if (idx !== 0) {
          const previousPoint = data[idx - 1];
          acc.statistics.groundDistance += this.calculateSlopeDistance(currentPoint, previousPoint);
          acc.statistics.elevationDifference += this.calculateElevationDifference(currentPoint, previousPoint);
        }

        acc.dataPoints.push({altitude: currentPoint.alts[ELEVATION_MODEL], distance: currentPoint.dist});
        return acc;
      },
      {
        dataPoints: [],
        statistics: {
          elevationDifference: 0,
          groundDistance: 0,
          highestPoint: 0,
          linearDistance: 0,
          lowestPoint: 0,
        },
      },
    );
  }

  private calculateSlopeDistance(currentPoint: ElevationProfileResponse, previousPoint: ElevationProfileResponse) {
    const elevationDelta = currentPoint.alts[ELEVATION_MODEL] - previousPoint.alts[ELEVATION_MODEL];
    const distanceDelta = currentPoint.dist - previousPoint.dist;

    return Math.sqrt(Math.pow(elevationDelta, 2) + Math.pow(distanceDelta, 2));
  }

  private calculateElevationDifference(currentPoint: ElevationProfileResponse, previousPoint: ElevationProfileResponse) {
    return currentPoint.alts[ELEVATION_MODEL] - previousPoint.alts[ELEVATION_MODEL];
  }

  private createElevationProfileUrl(): string {
    return `${this.apiBaseUrl}/profile.json`;
  }
}
