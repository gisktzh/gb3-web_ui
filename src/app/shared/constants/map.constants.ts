import {SupportedSrs} from '../types/supported-srs';

export class MapConstants {
  public static readonly MINIMUM_MAP_SCALE = 1_500_000;
  public static readonly MAXIMUM_MAP_SCALE = 100;
  public static readonly DEFAULT_SRS: SupportedSrs = 2056;
}
