import {Component, Input} from '@angular/core';
import {ConfigService} from '../../../../shared/services/config.service';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {Geometry} from 'geojson';
import {FeatureInfoActions} from '../../../../state/map/actions/feature-info.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'feature-info-content',
  templateUrl: './feature-info-content.component.html',
  styleUrls: ['./feature-info-content.component.scss']
})
export class FeatureInfoContentComponent {
  @Input() public featureInfo!: FeatureInfoResultDisplay;
  public readonly staticFilesBaseUrl: string;

  constructor(private readonly store: Store, readonly configService: ConfigService) {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public highlightFeature(feature: Geometry): void {
    this.store.dispatch(FeatureInfoActions.highlightFeature({feature}));
  }
}
