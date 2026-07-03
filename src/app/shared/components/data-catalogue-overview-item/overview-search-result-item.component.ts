import {Component, computed, inject, input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {NgTemplateOutlet} from '@angular/common';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MatTooltip} from '@angular/material/tooltip';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'overview-search-result-item',
  templateUrl: './overview-search-result-item.component.html',
  styleUrls: ['./overview-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, MatTooltip, NgTemplateOutlet, MatRipple],
})
export class OverviewSearchResultItemComponent {
  private readonly store = inject(Store);
  public readonly item = input.required<OverviewSearchResultDisplayItem>();
  // This is a workaround for OverviewSearchResultItemComponent that do not have the SearchResultIdentifierDirective applied to them (no arrow-key navigation enabled)
  // Can be removed if/when all searches have the arrow-key navigation enabled
  public readonly canFocusWithTabKey = input(false);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly isMobile = computed(() => this.screenMode() === 'mobile');
}
