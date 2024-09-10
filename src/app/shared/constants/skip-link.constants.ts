import {SkipLink} from '../types/skip-link.type';
import {TemplateVariables} from '../enums/template-variables.enum';

export class SkipLinkConstants {
  public static readonly skipLinks: SkipLink[] = [
    {id: TemplateVariables.Navigation, label: 'Navigation'},
    {id: TemplateVariables.MainContent, label: 'Inhalt'},
    {id: TemplateVariables.Footer, label: 'Fussbereich'},
  ];

  public static readonly skipLinksMobile: SkipLink[] = [
    {id: TemplateVariables.NavigationMobile, label: 'Navigation'},
    {id: TemplateVariables.MainContent, label: 'Inhalt'},
    {id: TemplateVariables.Footer, label: 'Fussbereich'},
  ];
}
