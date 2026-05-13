import {Component, inject} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Store} from '@ngrx/store';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLayerSelections} from '../../../../../state/map/reducers/map-import.reducer';
import {ExternalLayerId} from '../../../../../shared/types/external-layer-id.type';

@Component({
  selector: 'map-import-layer-list',
  imports: [MatCheckboxModule],
  templateUrl: './map-import-layer-list.component.html',
  styleUrl: './map-import-layer-list.component.scss',
})
export class MapImportLayerListComponent {
  private readonly store = inject(Store);

  public readonly layerSelections = this.store.selectSignal(selectLayerSelections);

  public toggleSelection(layerId: ExternalLayerId) {
    this.store.dispatch(MapImportActions.toggleLayerSelection({layerId}));
  }
}
