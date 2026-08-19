import {Component, computed, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectFeatureInfoQueryLoadingState} from 'src/app/state/map/selectors/feature-info-query-loading-state.selector';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {selectData as selectGeneralInfoData} from '../../../../state/map/reducers/general-info.reducer';
import {selectFeatureInfosForDisplay} from '../../../../state/map/selectors/feature-info-result-display.selector';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {FeatureInfoGeneralInformationComponent} from '../feature-info-general-information/feature-info-general-information.component';
import {MatDivider} from '@angular/material/divider';
import {FeatureInfoItemComponent} from '../feature-info-item/feature-info-item.component';
import {selectData as selectOerebExtractData} from 'src/app/state/map/reducers/oereb-extract.reducer';
import {OerebExtractComponent} from '../oereb-extract/oereb-extract.component';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss'],
  imports: [
    LoadingAndProcessBarComponent,
    FeatureInfoGeneralInformationComponent,
    MatDivider,
    FeatureInfoItemComponent,
    OerebExtractComponent,
  ],
})
export class FeatureInfoComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);

  public readonly loadingState = this.store.selectSignal(selectFeatureInfoQueryLoadingState);
  public readonly featureInfoData = this.store.selectSignal(selectFeatureInfosForDisplay);
  public readonly generalInfoData = this.store.selectSignal(selectGeneralInfoData);
  public readonly oerebExtract = this.store.selectSignal(selectOerebExtractData);

  public readonly hasNoInfoData = computed(() => this.featureInfoData().length === 0 && this.oerebExtract() === null);

  public trackById(_: number, item: FeatureInfoResultDisplay): string {
    return item.id;
  }
}
