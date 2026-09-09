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
  /**
   * True once the user has expressed intent about the area, by drawing it or by changing the radius. Such an area is kept when
   * switching tabs, whereas an automatically derived one is replaced by a newly derived one.
   */
  isUserDefined: boolean;
  data: StatisticsResult[];
}
