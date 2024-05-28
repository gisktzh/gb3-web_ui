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
  public static readonly DPI = 96;
  public static readonly DRAWING_IDENTIFIER = '__id';
  public static readonly DRAWING_LABEL_IDENTIFIER = '__labelText';
  public static readonly BELONGS_TO_IDENTIFIER = '__belongsTo';

  /**
   * Query params that are removed upon loading the initial map configuration.
   */
  public static readonly TEMPORARY_URL_PARAMS = ['initialMapIds'];

  /**
   * Delay in ms for triggering the temporary preview load of a hovered catalogue item.
   */
  public static readonly TEMPORARY_PREVIEW_DELAY = 250;

  /**
   * Map padding for initial map load for regular and smallTablet view
   */
  public static readonly INITIAL_MAP_PADDING = {
    left: 474,
    right: 172,
    top: 88,
    bottom: 88,
  };

  /**
   * Map padding for initial map load for mobile view
   */
  public static readonly INITIAL_MAP_PADDING_MOBILE = {
    left: 12,
    right: 12,
    top: 84,
    bottom: 100,
  };

  /**
   * Bounding Box for the Kanton of Zürich.
   */
  public static readonly KT_ZURICH_BOUNDING_BOX = {
    xmin: 2669240,
    ymin: 1223900,
    xmax: 2716890,
    ymax: 1283340,
  };
}
