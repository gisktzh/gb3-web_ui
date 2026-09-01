import {Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'data-display-section',
  templateUrl: './data-display-section.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./data-display-section.component.scss'],
})
export class DataDisplaySectionComponent {
  public readonly sectionTitle = input('');
}
