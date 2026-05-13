import {Component, effect, inject, input, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
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
    MatExpansionPanel,
    MatExpansionPanelHeader,
    ActiveMapItemHeaderComponent,
    MatExpansionPanelContent,
    MatButton,
    ActiveMapItemLayersComponent,
    ActiveMapItemSettingsComponent,
  ],
})
export class ActiveMapItemComponent {
  private readonly store = inject(Store);

  public readonly activeMapItem = input.required<ActiveMapItem>();
  public readonly isFirstActiveMapItem = input(false);
  public readonly isLastActiveMapItem = input(false);
  public readonly isDragAndDropDisabled = input(false);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly activeTab = signal<TabType>('layers');

  constructor() {
    effect(() => {
      if (this.activeMapItem().isSingleLayer) {
        this.activeTab.set('settings');
      }
    });
  }
}
