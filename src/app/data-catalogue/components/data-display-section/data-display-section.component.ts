import {Component, Input} from '@angular/core';

@Component({
  selector: 'data-display-section',
  templateUrl: './data-display-section.component.html',
  styleUrls: ['./data-display-section.component.scss'],
  standalone: false,
})
export class DataDisplaySectionComponent {
  @Input() public sectionTitle: string = '';
}
