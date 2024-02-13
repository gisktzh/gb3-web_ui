import {LinkObject} from '../interfaces/link-object.interface';
import {RelativeLinkObject} from '../interfaces/relative-link-object.interface';

import {DynamicInternalUrlsConfiguration} from '../types/dynamic-internal-url.type';

export class DynamicBaseUrlUtils {
  public static convertRelativeLinkObjectToLinkObject(
    link: LinkObject | RelativeLinkObject,
    dynamicUrls: DynamicInternalUrlsConfiguration,
  ): LinkObject {
    if ('baseUrlType' in link) {
      return {title: link.title, href: dynamicUrls[link.baseUrlType].href + link.relativeUrl};
    }

    return link;
  }
}
