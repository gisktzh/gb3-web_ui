import {TestBed} from '@angular/core/testing';

import {ONBOARDING_STEPS, OnboardingGuideService} from './onboarding-guide.service';
import {OnboardingGuideConfig} from '../interfaces/onboarding-guide-config.interface';
import {provideUiTour} from 'ngx-ui-tour-md-menu';

const mockTour: OnboardingGuideConfig = {
  id: 'mock.tour',
  steps: [
    {
      anchorId: 'map.tour.start',
      content: 'Lorem Ipsum',
      title: 'Lorem',
    },
    {
      anchorId: 'map.search.filter',
      content: 'Lorem Ipsum 2',
      title: 'Lorem 2',
    },
  ],
};

let store: Record<string, string> = {};

describe('OnboardingGuideService', () => {
  let service: OnboardingGuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideUiTour(), OnboardingGuideService, {provide: ONBOARDING_STEPS, useValue: mockTour}],
    });
    service = TestBed.inject(OnboardingGuideService);

    store = {};

    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string): string | null => {
      return store[key] || null;
    });
    vi.spyOn(localStorage, 'removeItem').mockImplementation((key: string): void => {
      delete store[key];
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    vi.spyOn(localStorage, 'clear').mockImplementation(() => {
      store = {};
    });
  });

  describe('autoStart', () => {
    it('starts the tour if localStorage does not contain the tour id', () => {
      const startSpy = vi.spyOn(service, 'start');

      service.autoStart();

      expect(startSpy).toHaveBeenCalled();
    });

    it('does not start the tour if localStorage contains the tour id', () => {
      localStorage.setItem('onboardingGuidesViewed', JSON.stringify([mockTour.id]));
      const startSpy = vi.spyOn(service, 'start');

      service.autoStart();

      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('sets the localStorage item when a tour starts', () => {
      service.start();

      const result = localStorage.getItem('onboardingGuidesViewed')!;
      const resultAsArray = JSON.parse(result);

      expect(resultAsArray).toContain(mockTour.id);
    });

    it('appends the tour id if other tours have already been viewed', () => {
      const existingTours = ['mock.tour.1', 'mock.tour.2'];
      localStorage.setItem('onboardingGuidesViewed', JSON.stringify(existingTours));

      service.start();
      const result = localStorage.getItem('onboardingGuidesViewed')!;
      const resultAsArray = JSON.parse(result);

      expect(resultAsArray).toContain(mockTour.id);
      expect(resultAsArray.length).toEqual(existingTours.length + 1);
    });

    it('does not append the tour id if it has already been viewed', () => {
      const existingTours = [mockTour.id, 'other.mock.tour'];
      localStorage.setItem('onboardingGuidesViewed', JSON.stringify(existingTours));

      service.start();
      const result = localStorage.getItem('onboardingGuidesViewed')!;
      const resultAsArray = JSON.parse(result);

      expect(resultAsArray).toContain(mockTour.id);
      expect(resultAsArray.length).toEqual(existingTours.length);
      expect(resultAsArray.filter((v: string) => v === mockTour.id).length).toEqual(1);
    });

    it('works if the local storage contains invalid data for parsing by overiding it with current id', () => {
      const nonArrayContent = 'a-non-array';
      localStorage.setItem('onboardingGuidesViewed', JSON.stringify(nonArrayContent));

      service.start();
      const result = localStorage.getItem('onboardingGuidesViewed')!;
      const resultAsArray = JSON.parse(result);

      expect(resultAsArray).toContain(mockTour.id);
      expect(resultAsArray.length).toEqual(1);
    });
  });
});
