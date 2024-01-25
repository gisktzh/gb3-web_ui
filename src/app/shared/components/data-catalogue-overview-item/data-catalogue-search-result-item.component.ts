import {Component, Input} from '@angular/core';
import {OverviewMetadataItem} from '../../models/overview-metadata-item.model';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';

@Component({
  standalone: true,
  selector: 'data-catalogue-search-result-item',
  templateUrl: './data-catalogue-search-result-item.component.html',
  styleUrls: ['./data-catalogue-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, ClickOnSpaceBarDirective],
})
export class DataCatalogueSearchResultItemComponent {
  @Input() public item!: OverviewMetadataItem;
}
