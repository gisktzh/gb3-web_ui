import {Component, input, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {LegendDisplay} from 'src/app/shared/interfaces/legend.interface';
import {selectLoadingState} from 'src/app/state/map/reducers/legend.reducer';
import {selectLegendItemsForDisplay} from 'src/app/state/map/selectors/legend-result-display.selector';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {LegendItemComponent} from '../legend-item/legend-item.component';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  imports: [LoadingAndProcessBarComponent, LegendItemComponent],
})
export class LegendComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);
  public readonly legendItems = this.store.selectSignal(selectLegendItemsForDisplay);
  public readonly loadingState = this.store.selectSignal(selectLoadingState);

  public trackById(_: number, item: LegendDisplay): string {
    return item.id;
  }
}
