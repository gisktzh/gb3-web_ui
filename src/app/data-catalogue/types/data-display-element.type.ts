import {LinkObject} from '../../shared/interfaces/link-object.interface';

interface AbstractDataDisplayElement {
  title: string;
  value: string[] | string | LinkObject[] | null;
  type: 'text' | 'url' | 'stringList' | 'urlList';
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

interface StringListDataDisplayElement extends AbstractDataDisplayElement {
  type: 'stringList';
  value: string[] | null;
}

interface UrlListDataDisplayElement extends AbstractDataDisplayElement {
  type: 'urlList';
  value: LinkObject[] | null;
}

export type DataDisplayElement = TextDataDisplayElement | UrlDataDisplayElement | StringListDataDisplayElement | UrlListDataDisplayElement;
