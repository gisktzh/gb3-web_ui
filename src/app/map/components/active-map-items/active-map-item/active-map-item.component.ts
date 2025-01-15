import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';

type TabType = 'layers' | 'settings';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss'],
  standalone: false,
})
export class ActiveMapItemComponent implements OnInit, OnDestroy {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public isFirstActiveMapItem: boolean = false;
  @Input() public isLastActiveMapItem: boolean = false;
  @Input() public isDragAndDropDisabled: boolean = false;

  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions = new Subscription();
  constructor(private readonly store: Store) {}

  public activeTab: TabType = 'layers';

  public ngOnInit() {
    if (this.activeMapItem.isSingleLayer) {
      this.activeTab = 'settings';
    }
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public changeTabs(tab: TabType) {
    this.activeTab = tab;
  }
}
