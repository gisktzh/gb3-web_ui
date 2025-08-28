import {Injectable, inject} from '@angular/core';
import {FeatureFlags} from '../interfaces/feature-flags.interface';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private readonly configService = inject(ConfigService);

  private readonly featureFlags: FeatureFlags = this.configService.featureFlags;

  public getFeatureFlag(featureName: keyof FeatureFlags): boolean {
    return this.featureFlags[featureName];
  }
}
