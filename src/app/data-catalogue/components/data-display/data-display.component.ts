import {Component, Input} from '@angular/core';

export interface AbstractDataDisplayElement {
  title: string;
  value: string | null;
  type: 'text' | 'url' | 'email';
}

interface TextDataDisplayElement extends AbstractDataDisplayElement {
  type: 'text';
}

interface UrlDataDisplayElement extends AbstractDataDisplayElement {
  type: 'url';
  displayText?: string;
}

interface EmailDataDisplayElement extends AbstractDataDisplayElement {
  type: 'email';
}

export type DataDisplayElement = EmailDataDisplayElement | TextDataDisplayElement | UrlDataDisplayElement;
@Component({
  selector: 'data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent {
  @Input() public elements: DataDisplayElement[] = [];
}
