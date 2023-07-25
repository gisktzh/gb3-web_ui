import {Component, Input} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';

@Component({
  selector: 'data-catalogue-detail-page',
  templateUrl: './data-catalogue-detail-page.component.html',
  styleUrls: ['./data-catalogue-detail-page.component.scss'],
})
export class DataCatalogueDetailPageComponent {
  @Input() public baseMetadataInformation!: BaseMetadataInformation;
  public readonly mainPageEnum = MainPage;
}
