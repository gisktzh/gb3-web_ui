import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapConfigActions} from 'src/app/state/map/actions/map-config.actions';

import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MapRotationPipe} from '../../../pipes/map-rotation.pipe';

@Component({
  selector: 'map-rotation-button',
  templateUrl: './map-rotation-button.component.html',
  styleUrls: ['./map-rotation-button.component.scss'],
  imports: [MatIconButton, MatTooltip, MatIcon, MapRotationPipe],
})
export class MapRotationButtonComponent {
  private readonly store = inject(Store);

  public readonly rotation = input(0);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  public resetRotation() {
    this.store.dispatch(MapConfigActions.setRotation({rotation: 0}));
  }
}
