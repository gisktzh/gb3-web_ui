import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {Store} from '@ngrx/store';
import {FeatureFlagsService} from '../../../../shared/services/feature-flags.service';
import {QueryMode} from '../../../../shared/types/query-mode.type';
import {QueryModeActions} from '../../../../state/map/actions/query-mode.actions';
import {selectQueryMode} from '../../../../state/map/reducers/query-mode.reducer';
import {FeatureInfoComponent} from '../feature-info/feature-info.component';
import {StatisticsComponent} from '../statistics/statistics.component';

@Component({
  selector: 'query-results',
  templateUrl: './query-results.component.html',
  styleUrl: './query-results.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatTabNav, MatTabLink, MatTabNavPanel, FeatureInfoComponent, StatisticsComponent],
})
export class QueryResultsComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);
  public readonly statisticsEnabled = inject(FeatureFlagsService).getFeatureFlag('statisticsTool');
  public readonly queryMode = this.store.selectSignal(selectQueryMode);

  public selectMode(queryMode: QueryMode) {
    if (this.showInteractiveElements()) {
      this.store.dispatch(QueryModeActions.selectQueryMode({queryMode}));
    }
  }
}
