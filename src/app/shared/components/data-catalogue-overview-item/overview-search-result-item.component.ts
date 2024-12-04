import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatButtonModule, MatIconAnchor} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';
import {SearchResultIdentifierDirective} from '../../directives/search-result-identifier.directive';

@Component({
  selector: 'overview-search-result-item',
  templateUrl: './overview-search-result-item.component.html',
  styleUrls: ['./overview-search-result-item.component.scss'],
  imports: [
    RouterModule,
    MatIcon,
    MatDivider,
    MatButtonModule,
    ClickOnSpaceBarDirective,
    NgForOf,
    NgClass,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    MatTooltip,
    SearchResultIdentifierDirective,
  ],
})
export class OverviewSearchResultItemComponent implements OnInit, OnDestroy {
  @ViewChild('externalLink') public readonly externalLink?: MatIconAnchor;
  @ViewChild('internalLink') public readonly internalLink?: MatIconAnchor;
  @ViewChild(SearchResultIdentifierDirective) public readonly searchResultElement!: SearchResultIdentifierDirective;
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

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    if (event.isTrusted) {
      return;
    }
    if (this.item.url.isInternal) {
      this.internalLink?._elementRef.nativeElement.click();
    } else {
      this.externalLink?._elementRef.nativeElement.click();
    }
  }
}
