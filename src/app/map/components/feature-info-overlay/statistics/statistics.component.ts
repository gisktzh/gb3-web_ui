import {Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDivider} from '@angular/material/divider';
import {MatFormField, MatLabel, MatInput, MatSuffix} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/autocomplete';
import {StatisticsActions} from '../../../../state/map/actions/statistics.actions';
import {selectData as selectGeneralInfoData} from '../../../../state/map/reducers/general-info.reducer';
import {
  selectData,
  selectGeometry,
  selectLoadingState,
  selectMode,
  selectRadiusInMeters,
} from '../../../../state/map/reducers/statistics.reducer';
import {StatisticsMode} from '../../../../shared/types/statistics-mode.type';
import {maximumStatisticsRadiusInMeters, minimumStatisticsRadiusInMeters} from '../../../../shared/configs/statistics.config';
import {calculateAreaInSquareMeters} from '../../../../shared/utils/statistics-geometry.utils';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {FeatureInfoGeneralInformationComponent} from '../feature-info-general-information/feature-info-general-information.component';
import {StatisticsItemComponent} from '../statistics-item/statistics-item.component';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    LoadingAndProcessBarComponent,
    FeatureInfoGeneralInformationComponent,
    StatisticsItemComponent,
    MatDivider,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatSelect,
    MatOption,
  ],
})
export class StatisticsComponent {
  private readonly store = inject(Store);

  public readonly showInteractiveElements = input(true);

  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  public readonly data = this.store.selectSignal(selectData);
  public readonly mode = this.store.selectSignal(selectMode);
  public readonly radiusInMeters = this.store.selectSignal(selectRadiusInMeters);
  public readonly geometry = this.store.selectSignal(selectGeometry);
  public readonly generalInfoData = this.store.selectSignal(selectGeneralInfoData);

  public readonly minimumRadius = minimumStatisticsRadiusInMeters;
  public readonly maximumRadius = maximumStatisticsRadiusInMeters;

  public areaInSquareMeters() {
    const geometry = this.geometry();
    return geometry ? calculateAreaInSquareMeters(geometry) : undefined;
  }

  public setMode(mode: StatisticsMode) {
    if (mode === this.mode()) {
      return;
    }

    this.store.dispatch(StatisticsActions.setMode({mode}));
  }

  public setRadius(value: string) {
    const radiusInMeters = Number(value);
    if (Number.isNaN(radiusInMeters) || radiusInMeters < this.minimumRadius || radiusInMeters > this.maximumRadius) {
      return;
    }

    this.store.dispatch(StatisticsActions.setRadius({radiusInMeters}));
  }
}
