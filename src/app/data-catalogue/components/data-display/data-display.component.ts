import {Component, Input} from '@angular/core';
import {DataDisplayElement} from '../../types/data-display-element.type';

import {TextOrPlaceholderPipe} from '../../../shared/pipes/text-or-placeholder.pipe';

@Component({
  selector: 'data-display',
  imports: [TextOrPlaceholderPipe],
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent {
  @Input() public elements: DataDisplayElement[] = [];
}
