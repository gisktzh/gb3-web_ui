import {Component, inject, output} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Basemap} from '../../../../../shared/interfaces/basemap.interface';
import {MapConfigActions} from '../../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../../services/basemap-config.service';
import {MatButton} from '@angular/material/button';
import {BasemapImageLinkPipe} from '../../../../../shared/pipes/background-map-image-link.pipe';

@Component({
  selector: 'basemap-selection-list',
  templateUrl: './basemap-selection-list.component.html',
  styleUrls: ['./basemap-selection-list.component.scss'],
  imports: [MatButton, BasemapImageLinkPipe],
})
export class BasemapSelectionListComponent {
  private readonly store = inject(Store);

  public readonly basemapChangedEvent = output();

  public availableBasemaps: Basemap[] = inject(BasemapConfigService).availableBasemaps;
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly activeBasemapId = this.store.selectSignal(selectActiveBasemapId);

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigActions.setBasemap({activeBasemapId: toId}));
    this.basemapChangedEvent.emit();
  }
}
