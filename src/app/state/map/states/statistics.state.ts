import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsMode} from '../../../shared/types/statistics-mode.type';

export interface StatisticsState extends HasLoadingState {
  mode: StatisticsMode;
  radiusInMeters: number;
  /** The effective area the statistics are queried for, either the derived circle or a drawn polygon. */
  geometry: GeometryWithSrs | undefined;
  areaInSquareMeters: number | undefined;
  data: StatisticsResult[];
}
