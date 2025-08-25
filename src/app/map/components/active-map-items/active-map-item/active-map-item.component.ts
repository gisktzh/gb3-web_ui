import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {NgClass} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';
import {ActiveMapItemHeaderComponent} from '../active-map-item-header/active-map-item-header.component';
import {MatButton} from '@angular/material/button';
import {ActiveMapItemLayersComponent} from '../active-map-item-layers/active-map-item-layers.component';
import {ActiveMapItemSettingsComponent} from '../active-map-item-settings/active-map-item-settings.component';

type TabType = 'layers' | 'settings';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss'],
  imports: [
    NgClass,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    ActiveMapItemHeaderComponent,
    MatExpansionPanelContent,
    MatButton,
    ActiveMapItemLayersComponent,
    ActiveMapItemSettingsComponent,
  ],
})
export class ActiveMapItemComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public isFirstActiveMapItem: boolean = false;
  @Input() public isLastActiveMapItem: boolean = false;
  @Input() public isDragAndDropDisabled: boolean = false;

  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions = new Subscription();

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
