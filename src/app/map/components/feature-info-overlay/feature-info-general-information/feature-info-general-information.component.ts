import {Component, Input} from '@angular/core';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';

@Component({
  selector: 'feature-info-general-information',
  templateUrl: './feature-info-general-information.component.html',
  styleUrls: ['./feature-info-general-information.component.scss'],
})
export class FeatureInfoGeneralInformationComponent {
  @Input() public generalInfoData!: GeneralInfoResponse;
}
