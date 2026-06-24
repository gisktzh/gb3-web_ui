import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';
import {BasemapSelectorComponent} from './basemap-selector/basemap-selector.component';

import {ScaleBarComponent} from './scale-bar/scale-bar.component';
import {CoordinateScaleInputsComponent} from './coordinate-scale-inputs/coordinate-scale-inputs.component';
import {ZoomControlsComponent} from './zoom-controls/zoom-controls.component';
import {UiToggleComponent} from './ui-toggle/ui-toggle.component';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss'],
  imports: [BasemapSelectorComponent, ScaleBarComponent, CoordinateScaleInputsComponent, ZoomControlsComponent, UiToggleComponent],
})
export class MapControlsComponent {
  private readonly store = inject(Store);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly mapUiState = this.store.selectSignal(selectMapUiState);
}
