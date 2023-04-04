import {LinkableElement} from './linkable-element.interface';

export type SupportLink = LinkableElement;

export interface SupportLinkCollection {
  label: string;
  links: SupportLink[];
}
