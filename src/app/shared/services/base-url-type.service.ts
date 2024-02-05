import {Injectable} from '@angular/core';
import {LinkObject} from '../interfaces/link-object.interface';
import {RelativeLinkObject} from '../interfaces/relative-link-object.interface';
import {ConfigService} from './config.service';
import {LinksGroup, RelativeLinksGroup} from '../interfaces/links-group.interface';

@Injectable({
  providedIn: 'root',
})
export class BaseUrlTypeService {
  constructor(protected readonly configService: ConfigService) {}

  public convertRelativeLinksGroupsToLinksGroups(relativeLinksGroups: RelativeLinksGroup[]): LinksGroup[] {
    return relativeLinksGroups.map((linksGroup) => {
      return {
        ...linksGroup,
        links: linksGroup.links.map((link) => {
          return this.convertRelativeLinkObjectToLinkObject(link);
        }),
      };
    });
  }

  public convertRelativeLinkObjectToLinkObject(link: LinkObject | RelativeLinkObject): LinkObject {
    if ('baseUrlType' in link) {
      switch (link.baseUrlType) {
        case 'Geolion':
          return {title: link.title, href: this.configService.apiConfig.geoLion.baseUrl + link.relativeUrl};
      }
    }
    return link;
  }
}
