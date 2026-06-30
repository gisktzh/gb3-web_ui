import {Component, inject, signal, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Basemap} from '../../../../shared/interfaces/basemap.interface';
import {selectActiveBasemapId} from '../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../services/basemap-config.service';
import {TypedTourAnchorDirective} from '../../../../shared/directives/typed-tour-anchor.directive';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';

import {BasemapSelectionListComponent} from './basemap-selection-list/basemap-selection-list.component';
import {BasemapImageLinkPipe} from '../../../../shared/pipes/background-map-image-link.pipe';
import {NgClickOutsideDirective} from 'ng-click-outside2';

@Component({
  selector: 'basemap-selector',
  templateUrl: './basemap-selector.component.html',
  styleUrls: ['./basemap-selector.component.scss'],
  imports: [TypedTourAnchorDirective, MatButton, MatTooltip, BasemapSelectionListComponent, BasemapImageLinkPipe, NgClickOutsideDirective],
})
export class BasemapSelectorComponent {
  private readonly store = inject(Store);

  private readonly basemapSelectorButtonRef = viewChild<MatButton>('basemapSelectorButton');
  public readonly activeBasemapId = this.store.selectSignal(selectActiveBasemapId);
  public readonly isSelectionOpen = signal(false);
  public readonly availableBasemaps: Basemap[] = inject(BasemapConfigService).availableBasemaps;

  public toggleSelectionAndFocusBasemapSelectorButton() {
    this.toggleSelection();
    this.basemapSelectorButtonRef()?.focus();
  }

  public toggleSelection() {
    this.isSelectionOpen.set(!this.isSelectionOpen());
  }
}
