import {Component, Input} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';

@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss']
})
export class FeatureInfoContentComponent {
  @Input() public featureInfo!: FeatureInfoResultDisplay;
  public readonly staticFilesBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.staticFilesBaseUrl = configService.apiConfig.gb2StaticFiles.baseUrl;
  }
}
