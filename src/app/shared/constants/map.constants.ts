import {SupportedSrs} from '../types/supported-srs';

export class MapConstants {
  public static readonly MINIMUM_MAP_SCALE = 1_500_000;
  public static readonly MAXIMUM_MAP_SCALE = 100;
  public static readonly DEFAULT_SRS: SupportedSrs = 2056;
  public static readonly INTERNAL_LAYER_PREFIX = 'INTERNAL__';
  public static readonly LOCATE_ME_ZOOM = 750;
  public static readonly DEFAULT_DPI = 96;
  public static readonly INCHES_PER_UNIT = {
    m: 39.3701,
    degrees: 4374754,
  };
}
