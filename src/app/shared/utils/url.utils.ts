import {PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';
import {MainPage} from '../enums/main-page.enum';

export class UrlUtils {
  /**
   * Extracts the first segment path of the given URL.
   * @param url The URL of which the first segment shall be extracted
   * @param router The Angular router necessary to parse the URL.
   *
   * @example
   * '/maps?x=2682260&y=1248390&scale=320000&basemap=arelkbackgroundzh?' will return 'maps'
   * '/support/faq' will return 'support'
   * '/' will return ''
   */
  public static extractFirstUrlSegmentPath(url: string, router: Router): string {
    const urlTree: UrlTree = router.parseUrl(url);
    const urlSegmentGroup: UrlSegmentGroup | undefined = urlTree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments ?? urlTree.root.segments;
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
}
