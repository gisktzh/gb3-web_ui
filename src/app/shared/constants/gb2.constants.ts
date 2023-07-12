export class Gb2Constants {
  /**
   * This mime type should be used as an additional FORMAT parameter for all WMS requests, because withholding it requests 24bit PNGs which
   * seem to have a negative impact on performance.
   */
  public static readonly WMS_IMAGE_FORMAT_MIME_TYPE = 'image/png; mode=8bit';
  /**
   * Internal layout DPI from Mapfish Print / Jasper Reports
   */
  public static readonly PRINT_DPI = 72;
}
