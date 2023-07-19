import {Component, Input} from '@angular/core';

@Component({
  selector: 'data-catalogue-detail-page-section',
  templateUrl: './data-catalogue-detail-page-section.component.html',
  styleUrls: ['./data-catalogue-detail-page-section.component.scss'],
})
export class DataCatalogueDetailPageSectionComponent {
  @Input() public hasTwoColumns: boolean = false;
}
