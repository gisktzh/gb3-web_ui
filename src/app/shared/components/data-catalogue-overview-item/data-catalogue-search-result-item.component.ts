import {Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass, NgForOf} from '@angular/common';
import {DataCatalogueSearchResultDisplayItem} from '../../interfaces/data-catalogue-search-resuilt-display.interface';

@Component({
  standalone: true,
  selector: 'data-catalogue-search-result-item',
  templateUrl: './data-catalogue-search-result-item.component.html',
  styleUrls: ['./data-catalogue-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, ClickOnSpaceBarDirective, NgForOf, NgClass],
})
export class DataCatalogueSearchResultItemComponent {
  @Input() public item!: DataCatalogueSearchResultDisplayItem;
}
