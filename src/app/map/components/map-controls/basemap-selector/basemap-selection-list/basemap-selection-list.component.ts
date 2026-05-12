import {Component, inject, output} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Basemap} from '../../../../../shared/interfaces/basemap.interface';
import {MapConfigActions} from '../../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../../services/basemap-config.service';
import {NgOptimizedImage} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {BasemapImageLinkPipe} from '../../../../../shared/pipes/background-map-image-link.pipe';

@Component({
  selector: 'basemap-selection-list',
  templateUrl: './basemap-selection-list.component.html',
  styleUrls: ['./basemap-selection-list.component.scss'],
  imports: [MatButton, NgOptimizedImage, BasemapImageLinkPipe],
})
export class BasemapSelectionListComponent {
  private readonly store = inject(Store);

  public basemapChangedEvent = output();

  public availableBasemaps: Basemap[] = inject(BasemapConfigService).availableBasemaps;
  public screenMode = this.store.selectSignal(selectScreenMode);
  public activeBasemapId = this.store.selectSignal(selectActiveBasemapId);

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigActions.setBasemap({activeBasemapId: toId}));
    this.basemapChangedEvent.emit();
  }
}
