import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRotation} from '../../../../state/map/reducers/map-config.reducer';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {ConfigService} from '../../../../shared/services/config.service';
import {CoordinateParserService} from '../../../services/coordinate-parser.service';
import {NumberUtils} from '../../../../shared/utils/number.utils';
import {TypedTourAnchorDirective} from '../../../../shared/directives/typed-tour-anchor.directive';
import {DataInputComponent} from '../data-input/data-input.component';
import {FormsModule} from '@angular/forms';
import {MapRotationButtonComponent} from '../map-rotation-button/map-rotation-button.component';

import {selectCenterReadable, selectRoundedScale} from 'src/app/state/map/selectors/map-config.selector';

/**
 * Note that for scale and mapCenter, we have two properties - one mimicks the state and one mimicks the input. The input value is used in
 * ngModel to ensure we get an updated value even if it is the same. This might happen if, for example, the current scale is "10000" and a
 * user then pasted "10'000": This will be changed to "10000" internally (correctly so) and does not dispatch a state change. However, this
 * needs to be reflected in the DOM as well, which does not happen since change detection does not pick up an identical value or cannot
 * change the field's value if it is still focused.
 *
 * Also note: We cannot use a number field for the scale input because it is a hard requirement to be able to pass e.g. "10'000", which does
 * not work natively in Firefox. See https://are-zh.atlassian.net/browse/GB3-1120 for more info.
 */
@Component({
  selector: 'coordinate-scale-inputs',
  templateUrl: './coordinate-scale-inputs.component.html',
  styleUrls: ['./coordinate-scale-inputs.component.scss'],
  imports: [TypedTourAnchorDirective, DataInputComponent, FormsModule, MapRotationButtonComponent],
})
export class CoordinateScaleInputsComponent {
  private readonly coordinateParserService = inject(CoordinateParserService);
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);

  public readonly scale = this.store.selectSignal(selectRoundedScale);
  public readonly mapCenter = this.store.selectSignal(selectCenterReadable);
  public readonly rotation = this.store.selectSignal(selectRotation);

  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;

  public setScale(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    const newScale = NumberUtils.parseNumberFromMixedString(input);

    if (newScale && newScale !== this.scale()) {
      this.store.dispatch(MapConfigActions.setScale({scale: newScale}));
    }
  }

  public setMapCenterAndDrawHighlight(event: Event) {
    const input = event.target as HTMLInputElement;
    const center = this.coordinateParserService.parse(input.value);

    if (center) {
      this.store.dispatch(MapConfigActions.setMapCenterAndDrawHighlight({center}));
    }
  }
}
