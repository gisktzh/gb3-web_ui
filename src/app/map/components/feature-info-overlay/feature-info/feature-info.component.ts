import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectFeatureInfoQueryLoadingState} from 'src/app/state/map/selectors/feature-info-query-loading-state.selector';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {selectData} from '../../../../state/map/reducers/general-info.reducer';
import {selectFeatureInfosForDisplay} from '../../../../state/map/selectors/feature-info-result-display.selector';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {FeatureInfoGeneralInformationComponent} from '../feature-info-general-information/feature-info-general-information.component';
import {MatDivider} from '@angular/material/divider';
import {FeatureInfoItemComponent} from '../feature-info-item/feature-info-item.component';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss'],
  imports: [LoadingAndProcessBarComponent, FeatureInfoGeneralInformationComponent, MatDivider, FeatureInfoItemComponent],
})
export class FeatureInfoComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);

  public readonly loadingState = this.store.selectSignal(selectFeatureInfoQueryLoadingState);
  public readonly featureInfoData = this.store.selectSignal(selectFeatureInfosForDisplay);
  public readonly generalInfoData = this.store.selectSignal(selectData);

  public trackById(_: number, item: FeatureInfoResultDisplay): string {
    return item.id;
  }
}
