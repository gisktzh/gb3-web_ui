import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'overview-search-result-item',
  templateUrl: './overview-search-result-item.component.html',
  styleUrls: ['./overview-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, ClickOnSpaceBarDirective, NgForOf, NgClass, NgIf, MatTooltip],
})
export class OverviewSearchResultItemComponent implements OnInit, OnDestroy {
  @Input() public item!: OverviewSearchResultDisplayItem;
  public isMobile: boolean = false;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();
  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.isMobile = screenMode === 'mobile'))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
