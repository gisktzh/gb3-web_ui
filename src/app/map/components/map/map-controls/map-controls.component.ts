import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../../../core/state/map/actions/map-configuration.actions';
import {MapConfigurationEffects} from '../../../../core/state/map/effects/map-configuration.effects';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent {
  constructor(private readonly store: Store) {}

  public goToInitialExtent() {
    this.store.dispatch(MapConfigurationActions.resetExtent());
  }
}
