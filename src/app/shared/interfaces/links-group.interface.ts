import {LinkObject} from './link-object.interface';
import {RelativeLinkObject} from './relative-link-object.interface';

export interface AbstractLinksGroup {
  label: string;
  links: (LinkObject | RelativeLinkObject)[];
}

export interface LinksGroup extends AbstractLinksGroup {
  links: LinkObject[];
}
