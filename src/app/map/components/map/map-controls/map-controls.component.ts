import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../../../core/state/map/actions/map-configuration.actions';
import {ZoomType} from '../../../../shared/types/zoom-type';

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

  public handleZoom(zoomType: ZoomType) {
    this.store.dispatch(MapConfigurationActions.changeZoom({zoomType}));
  }
}
