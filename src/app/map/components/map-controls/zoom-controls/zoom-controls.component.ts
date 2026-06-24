import {Component, computed, inject, input} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/factories/tooltip-map-tools-and-controls.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {selectScreenHeight} from 'src/app/state/app/reducers/app-layout.reducer';
import {ZoomType} from '../../../../shared/types/zoom.type';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../state/map/reducers/map-config.reducer';
import {selectMapUiState} from '../../../../state/map/reducers/map-ui.reducer';
import {MatIconButton} from '@angular/material/button';

import {MatIcon} from '@angular/material/icon';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MatDivider} from '@angular/material/divider';

const TOOLTIP_TEXT = {
  locateMe: 'Deinen Standort anzeigen',
  home: 'Ganze Karte anzeigen',
  zoomIn: 'Vergrössern',
  zoomOut: 'Verkleinern',
};
@Component({
  selector: 'zoom-controls',
  templateUrl: './zoom-controls.component.html',
  styleUrls: ['./zoom-controls.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryMapToolsAndControls, deps: [ConfigService]}],
  imports: [MatIconButton, MatTooltip, MatIcon, LoadingAndProcessBarComponent, MatDivider],
})
export class ZoomControlsComponent {
  private readonly store = inject(Store);

  public readonly showLocateMeButton = input.required<boolean>();

  public tooltipText = TOOLTIP_TEXT;

  public readonly isMaxZoomedIn = this.store.selectSignal(selectIsMaxZoomedIn);
  public readonly isMaxZoomedOut = this.store.selectSignal(selectIsMaxZoomedOut);
  public readonly geolocationState = this.store.selectSignal(selectGeolocationState);
  public readonly mapUiState = this.store.selectSignal(selectMapUiState);
  public readonly screenHeight = this.store.selectSignal(selectScreenHeight);
  public readonly locationButtonTooltipText = computed(() => {
    const geolocationState = this.geolocationState();
    if (geolocationState.loadingState === 'error') {
      return geolocationState.errorReason ?? 'Ein Fehler ist aufgetreten';
    }

    return this.tooltipText.locateMe;
  });

  public goToInitialExtent() {
    this.store.dispatch(MapConfigActions.resetExtent());
  }

  public handleZoom(zoomType: ZoomType) {
    this.store.dispatch(MapConfigActions.changeZoom({zoomType}));
  }

  public locateClient() {
    this.store.dispatch(GeolocationActions.startLocationRequest());
  }
}
