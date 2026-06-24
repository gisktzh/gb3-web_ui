import {Component, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';

import {selectScaleBarConfig} from '../../../../state/map/selectors/scale-bar-config.selector';

@Component({
  selector: 'scale-bar',
  templateUrl: './scale-bar.component.html',
  styleUrls: ['./scale-bar.component.scss'],
})
export class ScaleBarComponent {
  private readonly store = inject(Store);

  public readonly scaleBarConfig = this.store.selectSignal(selectScaleBarConfig);
  public readonly scaleBarLabel = computed(() => {
    const scaleBarConfig = this.scaleBarConfig();
    if (!scaleBarConfig) {
      return '';
    }

    return `${scaleBarConfig.value} ${scaleBarConfig.unit}`;
  });

  public readonly scaleBarStyle = computed(() => {
    const scaleBarConfig = this.scaleBarConfig();
    if (!scaleBarConfig) {
      return '';
    }

    return `width: ${scaleBarConfig.scaleBarWidthInPx}px;`;
  });
}
