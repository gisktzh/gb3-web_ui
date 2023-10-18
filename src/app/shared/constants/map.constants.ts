import {SupportedSrs} from '../types/supported-srs.type';

export class MapConstants {
  public static readonly MINIMUM_MAP_SCALE = 1_500_000;
  public static readonly MAXIMUM_MAP_SCALE = 1;
  public static readonly DEFAULT_SRS: SupportedSrs = 2056;
  public static readonly INTERNAL_LAYER_PREFIX = 'INTERNAL__';
  public static readonly USER_DRAWING_LAYER_PREFIX = 'USER_DRAWING__';
  public static readonly LOCATE_ME_ZOOM = 750;
  public static readonly INCHES_PER_UNIT = {
    m: 39.3701,
    degrees: 4374754,
  };
  public static readonly DRAWING_IDENTIFIER = '__id';
  public static readonly DRAWING_LABEL_IDENTIFIER = '__labelText';

  /**
   * Query params that are removed upon loading the initial map configuration.
   */
  public static readonly TEMPORARY_URL_PARAMS = ['initialMapIds'];
}
