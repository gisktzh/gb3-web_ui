import {Component, input, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectIsFeatureInfoOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectFeatureInfoQueryLoadingState} from '../../../state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';
import {selectFeatureInfoPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {FeatureInfoComponent} from './feature-info/feature-info.component';

@Component({
  selector: 'feature-info-overlay',
  templateUrl: './feature-info-overlay.component.html',
  styleUrls: ['./feature-info-overlay.component.scss'],
  imports: [MapOverlayComponent, FeatureInfoComponent],
})
export class FeatureInfoOverlayComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);

  public readonly isVisible = this.store.selectSignal(selectIsFeatureInfoOverlayVisible);
  public readonly featureInfoData = this.store.selectSignal(selectFeatureInfosForDisplay);
  public readonly loadingState = this.store.selectSignal(selectFeatureInfoQueryLoadingState);
  public readonly printLoadingState = this.store.selectSignal(selectFeatureInfoPrintState);

  public close() {
    this.store.dispatch(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
  }

  public print() {
    this.store.dispatch(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
  }
}
