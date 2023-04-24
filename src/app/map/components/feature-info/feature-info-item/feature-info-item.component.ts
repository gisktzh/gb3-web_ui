import {Component, Input} from '@angular/core';
import {Geometry} from 'geojson';
import {Store} from '@ngrx/store';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss']
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResultDisplay;
  @Input() public isPrintable: boolean = false;

  constructor(private readonly store: Store) {}

  public highlightFeature(feature: Geometry): void {
    this.store.dispatch(FeatureInfoActions.highlightFeature({feature}));
  }
}
