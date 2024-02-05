import {LinkObject} from './link-object.interface';
import {RelativeLinkObject} from './relative-link-object.interface';

export interface LinksGroup {
  label: string;
  links: LinkObject[];
}

export interface RelativeLinksGroup {
  label: string;
  links: (LinkObject | RelativeLinkObject)[];
}
