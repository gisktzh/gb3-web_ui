import {TestBed} from '@angular/core/testing';

import {OnboardingGuideService} from './onboarding-guide.service';

describe('OnboardingGuideService', () => {
  let service: OnboardingGuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingGuideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
