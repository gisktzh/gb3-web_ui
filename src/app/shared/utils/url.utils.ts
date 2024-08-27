import {Params, PRIMARY_OUTLET, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';
import {MainPage} from '../enums/main-page.enum';

export class UrlUtils {
  /**
   * Extracts all segments of the given URL tree (UrlTree).
   * @param urlTree The UrlTree (parsed by using Angular router) of which the first segment shall be extracted
   *
   * @example
   * extractUrlSegments(router.parseUrl('/support/faq')) will return two segments UrlSegment('support') and UrlSegment('faq')
   */
  public static extractUrlSegments(urlTree: UrlTree): UrlSegment[] {
    const urlSegmentGroup: UrlSegmentGroup | undefined = urlTree.root.children[PRIMARY_OUTLET];
    return urlSegmentGroup?.segments ?? urlTree.root.segments;
  }

  /**
   * Extracts the first segment path of the given URL tree (UrlTree); or empty string if there is no segment
   * @param urlSegments The URL segments of which the first segment path shall be extracted
   *
   * @example
   * extractFirstUrlSegmentPath('/maps?x=2682260&y=1248390&scale=320000&basemap=arelkbackgroundzh?') will return 'maps'
   * extractFirstUrlSegmentPath('/support/faq') will return 'support'
   * extractFirstUrlSegmentPath('/') will return ''
   */
  public static extractFirstUrlSegmentPath(urlSegments: UrlSegment[]): string {
    return urlSegments.length > 0 ? urlSegments[0].path : '';
  }

  /**
   * Transforms the given (segment path) string to MainPage enum or `undefined` if it is not within the MainPage enum.
   * @param mainPageString A (segment path) string to be transformed into a MainPage enum.
   */
  public static transformStringToMainPage(mainPageString: string | undefined): MainPage | undefined {
    return mainPageString !== undefined && Object.values<string>(MainPage).includes(mainPageString)
      ? (mainPageString as MainPage)
      : undefined;
  }

  /**
   * Extracts the first segment and transforms it to MainPage enum or `undefined` if it is not within the MainPage enum.
   * @param urlTree The UrlTree (parsed by using Angular router) of which the MainPage shall be extracted
   */
  public static extractMainPage(urlTree: UrlTree): MainPage | undefined {
    const urlSegments = UrlUtils.extractUrlSegments(urlTree);
    const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(urlSegments);
    return UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
  }

  /**
   * Returns a value indicating whether the two given segment path arrays are equal
   */
  public static areSegmentPathsEqual(firstSegmentPaths: string[], secondSegmentPaths: string[]): boolean {
    return (
      firstSegmentPaths.length === secondSegmentPaths.length && firstSegmentPaths.every((path, index) => path === secondSegmentPaths[index])
    );
  }

  /**
   * Returns a value indicating whether the `mainSegmentPaths` is a subset of `otherSegmentPaths`
   */
  public static containsSegmentPaths(mainSegmentPaths: string[], otherSegmentPaths: string[]): boolean {
    return (
      mainSegmentPaths.length <= otherSegmentPaths.length && mainSegmentPaths.every((path, index) => path === otherSegmentPaths[index])
    );
  }

  /**
   * Returns a value indicating whether the two parameter values are equal; this works only for primitives types
   */
  public static areParamsEqual(firstParams: Params, secondParams: Params): boolean {
    return (
      Object.keys(firstParams).length === Object.keys(secondParams).length &&
      Object.keys(firstParams).every((key) => firstParams[key] === secondParams[key])
    );
  }

  /**
   * Extracts the URL parameters from the given parameters and filters out the last occurrence of each parameter
   * @param params
   */
  public static extractUrlParamsForMapInitialization(params: Params) {
    const {
      x: xParam,
      y: yParam,
      scale: scaleParam,
      basemap: basemapParam,
      initialMapIds: initialMapIdsParam,
      searchTerm: searchTermParam,
      searchIndex: searchIndexParam,
    } = params;

    const x = UrlUtils.extractLastOccurrenceOfParam(xParam);
    const y = UrlUtils.extractLastOccurrenceOfParam(yParam);
    const scale = UrlUtils.extractLastOccurrenceOfParam(scaleParam);
    const basemap = UrlUtils.extractLastOccurrenceOfParam(basemapParam);
    const initialMapIds = UrlUtils.extractLastOccurrenceOfParam(initialMapIdsParam);
    const searchTerm = UrlUtils.extractLastOccurrenceOfParam(searchTermParam);
    const searchIndex = searchIndexParam ? UrlUtils.extractLastOccurrenceOfParam(searchIndexParam).split(',')[0] : undefined;

    return {x, y, scale, basemap, initialMapIds, searchTerm, searchIndex};
  }

  /**
   * Extracts the last occurrence of the given parameter if it is an array; otherwise, it returns the parameter itself
   * @param param
   */
  public static extractLastOccurrenceOfParam<T>(param: T | T[]): T {
    return Array.isArray(param) ? param[param.length - 1] : param;
  }
}
