import {Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'data-catalogue-detail-page-section',
  templateUrl: './data-catalogue-detail-page-section.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./data-catalogue-detail-page-section.component.scss'],
})
export class DataCatalogueDetailPageSectionComponent {
  public readonly hasTwoColumns = input(false);
}
