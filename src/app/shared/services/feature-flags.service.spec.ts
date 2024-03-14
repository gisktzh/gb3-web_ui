import {TestBed} from '@angular/core/testing';
import {FeatureFlagsService} from './feature-flags.service';
import {ConfigService} from './config.service';
import {provideMockStore} from '@ngrx/store/testing';
import {FeatureFlags} from '../interfaces/feature-flags.interface';

const mockConfigService: ConfigService = {
  featureFlags: {
    oerebExtract: true,
  },
} as unknown as ConfigService;

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{provide: ConfigService, useValue: mockConfigService}, provideMockStore()],
    });
    service = TestBed.inject(FeatureFlagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFeatureFlag', () => {
    it('should return the value of the feature flag from the config service', () => {
      const featureFlag: keyof FeatureFlags = 'oerebExtract';
      const result = service.getFeatureFlag(featureFlag);

      expect(result).toEqual(mockConfigService.featureFlags.oerebExtract);
    });
  });
});
