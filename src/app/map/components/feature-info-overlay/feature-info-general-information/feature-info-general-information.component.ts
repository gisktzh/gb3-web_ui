import {Component, Input} from '@angular/core';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';
import {FeatureFlagsService} from '../../../../shared/services/feature-flags.service';

@Component({
  selector: 'feature-info-general-information',
  templateUrl: './feature-info-general-information.component.html',
  styleUrls: ['./feature-info-general-information.component.scss'],
})
export class FeatureInfoGeneralInformationComponent {
  constructor(public readonly featureFlagsService: FeatureFlagsService) {}
  @Input() public generalInfoData!: GeneralInfoResponse;
}
