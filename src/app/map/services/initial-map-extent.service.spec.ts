import {InitialMapExtentService} from './initial-map-extent.service';
import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';

describe('InitialMapExtentService', () => {
  let service: InitialMapExtentService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore()],
    });

    store = TestBed.inject(MockStore);
    service = TestBed.inject(InitialMapExtentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateInitialExtent', () => {
    it('should calculate the initial extent for wide, regular screens', () => {
      const mockWindow = {
        innerWidth: 2250,
        innerHeight: 1279,
      };

      Object.defineProperty(window, 'innerWidth', {
        get: () => mockWindow.innerWidth,
      });

      Object.defineProperty(window, 'innerHeight', {
        get: () => mockWindow.innerHeight,
      });

      service.screenMode = 'regular';
      const initialExtent = service.calculateInitialExtent();

      expect(Math.round(initialExtent.x)).toEqual(2684590);
      expect(Math.round(initialExtent.y)).toEqual(1253620);
      expect(Math.round(initialExtent.scale)).toEqual(217900);
    });
    it('should calculate the initial extent for high, regular screens', () => {
      const mockWindow = {
        innerWidth: 1580,
        innerHeight: 1279,
      };

      Object.defineProperty(window, 'innerWidth', {
        get: () => mockWindow.innerWidth,
      });

      Object.defineProperty(window, 'innerHeight', {
        get: () => mockWindow.innerHeight,
      });

      service.screenMode = 'regular';
      const initialExtent = service.calculateInitialExtent();

      expect(Math.round(initialExtent.x)).toEqual(2684590);
      expect(Math.round(initialExtent.y)).toEqual(1253620);
      expect(Math.round(initialExtent.scale)).toEqual(217900);
    });
    it('should calculate the initial extent for high mobile screens', () => {
      const mockWindow = {
        innerWidth: 414,
        innerHeight: 896,
      };

      Object.defineProperty(window, 'innerWidth', {
        get: () => mockWindow.innerWidth,
      });

      Object.defineProperty(window, 'innerHeight', {
        get: () => mockWindow.innerHeight,
      });

      service.screenMode = 'mobile';
      const initialExtent = service.calculateInitialExtent();

      expect(Math.round(initialExtent.x)).toEqual(2693065);
      expect(Math.round(initialExtent.y)).toEqual(1252643);
      expect(Math.round(initialExtent.scale)).toEqual(461781);
    });
    it('should calculate the initial extent for wide mobile screens', () => {
      const mockWindow = {
        innerWidth: 869,
        innerHeight: 414,
      };

      Object.defineProperty(window, 'innerWidth', {
        get: () => mockWindow.innerWidth,
      });

      Object.defineProperty(window, 'innerHeight', {
        get: () => mockWindow.innerHeight,
      });

      service.screenMode = 'mobile';
      const initialExtent = service.calculateInitialExtent();

      expect(Math.round(initialExtent.x)).toEqual(2693065);
      expect(Math.round(initialExtent.y)).toEqual(1251553);
      expect(Math.round(initialExtent.scale)).toEqual(976762);
    });
  });
});
