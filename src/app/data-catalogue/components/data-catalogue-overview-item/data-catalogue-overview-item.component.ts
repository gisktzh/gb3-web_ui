import {Component, Input} from '@angular/core';
import {DatasetOverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';

@Component({
  selector: 'data-catalogue-overview-item',
  templateUrl: './data-catalogue-overview-item.component.html',
  styleUrls: ['./data-catalogue-overview-item.component.scss'],
})
export class DataCatalogueOverviewItemComponent {
  @Input() public item!: DatasetOverviewMetadataItem;
}
