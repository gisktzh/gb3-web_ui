import {Injectable} from '@angular/core';
import {FeatureFlags} from '../interfaces/feature-flags.interface';
import {ConfigService} from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private readonly featureFlags: FeatureFlags = this.configService.featureFlags;

  constructor(private readonly configService: ConfigService) {}

  public getFeatureFlag(featureName: keyof FeatureFlags): boolean {
    return this.featureFlags[featureName];
  }
}
