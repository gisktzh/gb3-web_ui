import {Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'overview-search-result-item',
  templateUrl: './overview-search-result-item.component.html',
  styleUrls: ['./overview-search-result-item.component.scss'],
  imports: [RouterModule, MatIcon, MatDivider, MatButtonModule, NgClass, MatTooltip, NgTemplateOutlet, MatRipple],
})
export class OverviewSearchResultItemComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @ViewChild('externalLink') public readonly externalLink?: ElementRef;
  @ViewChild('internalLink') public readonly internalLink?: ElementRef;
  @Input() public item!: OverviewSearchResultDisplayItem;
  // This is a workaround for OverviewSearchResultItemComponent that do not have the SearchResultIdentifierDirective applied to them (no arrow-key navigation enabled)
  // Can be removed if/when all searches have the arrow-key navigation enabled
  @Input() public canFocusWithTabKey: boolean = false;
  public isMobile: boolean = false;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.isMobile = screenMode === 'mobile'))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    if (event.isTrusted) {
      return;
    }
    if (this.item.url.isInternal) {
      this.internalLink?.nativeElement.click();
    } else {
      this.externalLink?.nativeElement.click();
    }
  }
}
