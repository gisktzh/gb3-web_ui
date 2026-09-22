import {Observable} from 'rxjs';
import {GeometryWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {StatisticsResult} from '../../../interfaces/statistics.interface';

/**
 * DI seam for the statistics API. The backend endpoint does not exist yet, so only a mock implementation is provided; swapping in a
 * real implementation must not require changes outside of the provider registration in `main.ts`.
 */
export abstract class StatisticsService {
  public abstract loadStatistics(geometry: GeometryWithSrs): Observable<StatisticsResult[]>;
}
