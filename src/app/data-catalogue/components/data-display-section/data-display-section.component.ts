import {Component, input} from '@angular/core';

@Component({
  selector: 'data-display-section',
  templateUrl: './data-display-section.component.html',
  styleUrls: ['./data-display-section.component.scss'],
})
export class DataDisplaySectionComponent {
  public readonly sectionTitle = input('');
}
