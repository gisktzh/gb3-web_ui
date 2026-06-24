import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectLoadingState} from '../../../state/map/reducers/legend.reducer';
import {selectIsLegendOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';
import {selectLegendPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {selectLegendItemsForDisplay} from '../../../state/map/selectors/legend-result-display.selector';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {LegendComponent} from './legend/legend.component';

@Component({
  selector: 'legend-overlay',
  templateUrl: './legend-overlay.component.html',
  styleUrls: ['./legend-overlay.component.scss'],
  imports: [MapOverlayComponent, LegendComponent],
})
export class LegendOverlayComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);
  public readonly isVisible = this.store.selectSignal(selectIsLegendOverlayVisible);
  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  public readonly printLoadingState = this.store.selectSignal(selectLegendPrintState);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly legendItems = this.store.selectSignal(selectLegendItemsForDisplay);

  public close() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: false}));
  }

  public print() {
    this.store.dispatch(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
  }
}
