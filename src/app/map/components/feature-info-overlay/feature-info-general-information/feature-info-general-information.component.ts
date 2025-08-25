import {Component, Input} from '@angular/core';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {GenericUnorderedListComponent} from '../../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';
import {FeatureFlagDirective} from '../../../../shared/directives/feature-flag.directive';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'feature-info-general-information',
  templateUrl: './feature-info-general-information.component.html',
  styleUrls: ['./feature-info-general-information.component.scss'],
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    GenericUnorderedListComponent,
    FeatureFlagDirective,
    MatButton,
    MatTooltip,
    ShowTooltipIfTruncatedDirective,
    DecimalPipe,
  ],
})
export class FeatureInfoGeneralInformationComponent {
  @Input() public generalInfoData!: GeneralInfoResponse;
}
