import {SkipLink} from '../types/skip-link.type';

export class SkipLinkConstants {
  public static readonly skipLinks: SkipLink[] = [
    {id: 'navigation', label: 'Navigation'},
    {id: 'main-content', label: 'Inhalt'},
    {id: 'footer', label: 'Fussbereich'},
  ];

  public static readonly skipLinksMobile: SkipLink[] = [
    {id: 'navigation-mobile', label: 'Navigation'},
    {id: 'main-content', label: 'Inhalt'},
    {id: 'footer', label: 'Fussbereich'},
  ];
}
