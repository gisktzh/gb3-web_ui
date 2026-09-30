import {Observable} from 'rxjs';
import {GeometryWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {StatisticsResult} from '../../../interfaces/statistics.interface';

/**
 * DI seam for loading statistics for the selected area.
 */
export abstract class StatisticsService {
  public abstract loadStatistics(geometry: GeometryWithSrs): Observable<StatisticsResult[]>;
}
