import {Component, Input} from '@angular/core';
import {FeatureInfoResultLayer} from '../../../../shared/interfaces/feature-info.interface';

@Component({
  selector: 'feature-info-print-content',
  templateUrl: './feature-info-print-content.component.html',
  styleUrls: ['./feature-info-print-content.component.scss'],
})
export class FeatureInfoPrintContentComponent {
  @Input() public layer!: FeatureInfoResultLayer;
}
