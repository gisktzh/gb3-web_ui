import {Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';

@Component({
  standalone: true,
  selector: 'overview-search-result-item',
  templateUrl: './overview-search-result-item.component.html',
  styleUrls: ['./overview-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, ClickOnSpaceBarDirective, NgForOf, NgClass, NgIf],
})
export class OverviewSearchResultItemComponent {
  @Input() public item!: OverviewSearchResultDisplayItem;
}
