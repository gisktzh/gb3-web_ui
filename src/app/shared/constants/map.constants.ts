import {SupportedSrs} from '../types/supported-srs.type';
import {BoundingBox, InitialMapPadding} from '../../state/map/states/map-config.state';

export class MapConstants {
  public static readonly MINIMUM_MAP_SCALE = 1_500_000;
  public static readonly MAXIMUM_MAP_SCALE = 1;
  public static readonly DEFAULT_SRS: SupportedSrs = 2056;
  public static readonly LOCATE_ME_ZOOM = 750;
  public static readonly INCHES_PER_UNIT = {
    m: 39.3701,
    degrees: 4374754,
  };
  public static readonly DPI = 96;
  public static readonly NAV_BAR_HEIGHT = 72;
  public static readonly DRAWING_IDENTIFIER = '__id';
  public static readonly DRAWING_LABEL_IDENTIFIER = '__labelText';
  public static readonly BELONGS_TO_IDENTIFIER = '__belongsTo';
  public static readonly TOOL_IDENTIFIER = '__tool';
  public static readonly TEXT_DRAWING_MAX_LENGTH = 50;
  public static readonly MAX_SCALE_BAR_WIDTH_PX = 150;

  /**
   * Query params that are removed upon loading the initial map configuration.
   */
  public static readonly TEMPORARY_URL_PARAMS = ['initialMapIds', 'searchTerm', 'searchIndex'];

  /**
   * Delay in ms for triggering the temporary preview load of a hovered catalogue item.
   */
  public static readonly TEMPORARY_PREVIEW_DELAY = 250;

  /**
   * Map padding for initial map load for regular and smallTablet view
   */
  public static readonly INITIAL_MAP_PADDING: InitialMapPadding = {
    left: 474,
    right: 180,
    top: 88,
    bottom: 88,
  };

  /**
   * Map padding for initial map load for mobile view
   */
  public static readonly INITIAL_MAP_PADDING_MOBILE: InitialMapPadding = {
    left: 12,
    right: 12,
    top: 84,
    bottom: 100,
  };

  /**
   * Bounding Box for the Kanton of Zürich.
   */
  public static readonly KT_ZURICH_BOUNDING_BOX: BoundingBox = {
    min: {x: 2669240, y: 1223900},
    max: {x: 2716890, y: 1283340},
  };
}
