import {SkipLink} from '../types/skip-link.type';
import {SkipLinkTemplateVariable} from '../enums/skip-link-template-variable.enum';

export class SkipLinkConstants {
  public static readonly skipLinks: SkipLink[] = [
    {id: SkipLinkTemplateVariable.Navigation, label: 'Navigation'},
    {id: SkipLinkTemplateVariable.MainContent, label: 'Inhalt'},
    {id: SkipLinkTemplateVariable.Footer, label: 'Fussbereich'},
  ];
}
