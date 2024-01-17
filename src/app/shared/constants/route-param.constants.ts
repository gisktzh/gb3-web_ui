/**
 * Exposes route params that can be used to build routes and to access parameters in a unified way.
 */
export class RouteParamConstants {
  /** An identifier for a given resource, e.g. /data/items/123, where 123 is the identifier */
  public static readonly RESOURCE_IDENTIFIER = 'id';
  public static readonly DEV_MODE_PARAMETER = 'devMode';
  /**
   * Query params that are removed upon loading the page.
   */
  public static readonly GLOBAL_TEMPORARY_URL_PARAMS = [RouteParamConstants.DEV_MODE_PARAMETER];
}
