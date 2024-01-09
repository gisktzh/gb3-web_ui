import {LinkObject} from '../../shared/interfaces/link-object.interface';

interface AbstractDataDisplayElement {
  title: string;
  // value: string[] | string | null;
  type: 'text' | 'url' | 'email' | 'list' | 'urlList';
}

interface TextDataDisplayElement extends AbstractDataDisplayElement {
  type: 'text';
  value: string | null;
}

interface UrlDataDisplayElement extends AbstractDataDisplayElement {
  type: 'url';
  displayText?: string;
  value: string | null;
}

interface EmailDataDisplayElement extends AbstractDataDisplayElement {
  type: 'email';
  value: string | null;
}

interface ListDataDisplayElement extends AbstractDataDisplayElement {
  type: 'list';
  value: string[] | null;
}

interface UrlListDataDisplayElement extends AbstractDataDisplayElement {
  type: 'urlList';
  value: LinkObject[] | null;
}

export type DataDisplayElement =
  | EmailDataDisplayElement
  | TextDataDisplayElement
  | UrlDataDisplayElement
  | ListDataDisplayElement
  | UrlListDataDisplayElement;
