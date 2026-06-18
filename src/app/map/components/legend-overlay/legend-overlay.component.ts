import {Component, Input, inject} from '@angular/core';
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
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'legend-overlay',
  templateUrl: './legend-overlay.component.html',
  styleUrls: ['./legend-overlay.component.scss'],
  imports: [MapOverlayComponent, LegendComponent],
})
export class LegendOverlayComponent {
  private readonly store = inject(Store);

  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;

  public isVisible = toSignal(this.store.select(selectIsLegendOverlayVisible), {initialValue: false});
  public loadingState = toSignal(this.store.select(selectLoadingState));
  public printLoadingState = toSignal(this.store.select(selectLegendPrintState));
  public screenMode = toSignal(this.store.select(selectScreenMode), {initialValue: 'mobile'});
  public legendItems = toSignal(this.store.select(selectLegendItemsForDisplay), {initialValue: []});

  public close() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: false}));
  }

  public print() {
    this.store.dispatch(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
  }
}
