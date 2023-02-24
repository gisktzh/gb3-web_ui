import {TestBed} from '@angular/core/testing';

import {OnboardingGuideService} from './onboarding-guide.service';

describe('OnboardingGuideService', () => {
  let service: OnboardingGuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingGuideService);

    localStorage.clear();
  });

  describe('autoStart', () => {
    it('starts the tour if localStorage does not contain the key', () => {
      const startSpy = spyOn(service, 'start');

      service.autoStart();

      expect(startSpy).toHaveBeenCalled();
    });

    it('does not start the tour if localStorage contains the flag', () => {
      localStorage.setItem('onboardingGuideViewed', 'x');
      const startSpy = spyOn(service, 'start');

      service.autoStart();

      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('sets the localStorage key when a tour starts', () => {
      service.start();

      expect(localStorage.getItem('onboardingGuideViewed')).toBeTruthy();
    });
  });
});
