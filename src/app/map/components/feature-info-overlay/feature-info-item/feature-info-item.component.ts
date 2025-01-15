import {Component, Input} from '@angular/core';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss'],
  standalone: false,
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResultDisplay;
  @Input() public showInteractiveElements: boolean = true;
}
