import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
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
}
