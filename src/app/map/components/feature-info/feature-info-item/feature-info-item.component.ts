import {Component, Input} from '@angular/core';
import {FeatureInfoResult} from '../../../../shared/models/gb3-api.interfaces';
import {Geometry} from 'geojson';
import {Store} from '@ngrx/store';
import {FeatureInfoActions} from '../../../../core/state/map/actions/feature-info.actions';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss']
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResult;

  constructor(private readonly store: Store) {}

  public highlightFeature(feature: Geometry): void {
    this.store.dispatch(FeatureInfoActions.highlightFeature({feature}));
  }
}
