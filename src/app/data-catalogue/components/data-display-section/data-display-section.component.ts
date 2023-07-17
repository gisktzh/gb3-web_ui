import {Component, Input} from '@angular/core';
import {DataDisplayElement} from '../data-display/data-display.component';

@Component({
  selector: 'data-display-section',
  templateUrl: './data-display-section.component.html',
  styleUrls: ['./data-display-section.component.scss'],
})
export class DataDisplaySectionComponent {
  @Input() public sectionTitle: string = '';
  @Input() public dataDisplayElements: DataDisplayElement[] = [];
}
