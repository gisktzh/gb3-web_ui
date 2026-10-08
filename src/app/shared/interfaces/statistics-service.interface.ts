import {Observable} from 'rxjs';
import {GeometryWithSrs} from './geojson-types-with-srs.interface';
import {StatisticsQuery, StatisticsResult} from './statistics.interface';

export interface StatisticsService {
  loadStatistics(geometry: GeometryWithSrs, queries: readonly StatisticsQuery[]): Observable<StatisticsResult[]>;
}
