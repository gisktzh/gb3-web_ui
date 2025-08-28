import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'data-catalogue-detail-page-section',
  templateUrl: './data-catalogue-detail-page-section.component.html',
  styleUrls: ['./data-catalogue-detail-page-section.component.scss'],
  imports: [NgClass],
})
export class DataCatalogueDetailPageSectionComponent {
  @Input() public hasTwoColumns: boolean = false;
}
