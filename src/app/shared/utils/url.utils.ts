import {PRIMARY_OUTLET, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';
import {MainPage} from '../enums/main-page.enum';

export class UrlUtils {
  /**
   * Extracts all segments of the given URL tree (UrlTree).
   * @param urlTree The UrlTree (parsed by using Angular router) of which the first segment shall be extracted
   *
   * @example
   * router.parseUrl('/support/faq') will return two segments UrlSegment('support') and UrlSegment('faq')
   */
  public static extractUrlSegments(urlTree: UrlTree): UrlSegment[] {
    const urlSegmentGroup: UrlSegmentGroup | undefined = urlTree.root.children[PRIMARY_OUTLET];
    return urlSegmentGroup?.segments ?? urlTree.root.segments;
  }

  /**
   * Extracts the first segment path of the given URL tree (UrlTree).
   * @param urlTree The UrlTree (parsed by using Angular router) of which the first segment shall be extracted
   *
   * @example
   * extractFirstUrlSegmentPath('/maps?x=2682260&y=1248390&scale=320000&basemap=arelkbackgroundzh?') will return 'maps'
   * extractFirstUrlSegmentPath('/support/faq') will return 'support'
   * extractFirstUrlSegmentPath('/') will return ''
   */
  public static extractFirstUrlSegmentPath(urlTree: UrlTree): string {
    const urlSegment: UrlSegment[] = UrlUtils.extractUrlSegments(urlTree);
    return urlSegment.length > 0 ? urlSegment[0].path : '';
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

  public static areSegmentPathsEqual(firstSegmentPaths: string[], secondSegmentPaths: string[]): boolean {
    return (
      firstSegmentPaths.length === secondSegmentPaths.length && firstSegmentPaths.every((path, index) => path === secondSegmentPaths[index])
    );
  }

  public static containsSegmentPaths(mainSegmentPaths: string[], otherSegmentPaths: string[]): boolean {
    return (
      mainSegmentPaths.length <= otherSegmentPaths.length && mainSegmentPaths.every((path, index) => path === otherSegmentPaths[index])
    );
  }
}
