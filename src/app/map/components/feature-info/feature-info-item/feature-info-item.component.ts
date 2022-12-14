import {Component, Input} from '@angular/core';
import {FeatureInfoResult} from '../../../../shared/models/gb3-api.interfaces';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss']
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResult;
}
