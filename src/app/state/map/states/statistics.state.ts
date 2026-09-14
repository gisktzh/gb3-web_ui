import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {GeometryWithSrs, PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsMode} from '../../../shared/types/statistics-mode.type';

export interface StatisticsState extends HasLoadingState {
  mode: StatisticsMode;
  radiusInMeters: number;
  /** The centre of the circle in 'umkreis' mode; undefined until a location is known. */
  center: PointWithSrs | undefined;
  /** The effective area the statistics are queried for, either the derived circle or a drawn polygon. */
  geometry: GeometryWithSrs | undefined;
  data: StatisticsResult[];
}
