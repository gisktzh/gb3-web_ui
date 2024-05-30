import {InitialMapExtentService} from './initial-map-extent.service';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';

describe('InitialMapExtentService', () => {
  let service: InitialMapExtentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore()],
    });

    service = TestBed.inject(InitialMapExtentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateInitialExtent', () => {
    [
      {innerWidth: 1300, innerHeight: 1000},
      {innerWidth: 1500, innerHeight: 1000},
      {innerWidth: 100000, innerHeight: 1000},
    ].forEach((screen) => {
      it(`should calculate the same center and scale for wide, regular screens with constant height. width/height: (${screen.innerWidth}px/${screen.innerHeight}px)`, () => {
        const mockWindow = {
          innerWidth: screen.innerWidth,
          innerHeight: screen.innerHeight,
        };

        Object.defineProperty(window, 'innerWidth', {
          get: () => mockWindow.innerWidth,
        });

        Object.defineProperty(window, 'innerHeight', {
          get: () => mockWindow.innerHeight,
        });

        service.screenMode = 'regular';
        const initialExtent = service.calculateInitialExtent();

        expect(Math.round(initialExtent.x)).toEqual(2681446);
        expect(Math.round(initialExtent.y)).toEqual(1253620);
        expect(Math.round(initialExtent.scale)).toEqual(298744);
      });
    });
    [
      {innerWidth: 1000, innerHeight: 700},
      {innerWidth: 1000, innerHeight: 1000},
      {innerWidth: 1000, innerHeight: 1000000},
    ].forEach((screen) => {
      it(`should calculate the same center and scale for high, regular screens with constant width. width/height: (${screen.innerWidth}px/${screen.innerHeight}px)`, () => {
        const mockWindow = {
          innerWidth: screen.innerWidth,
          innerHeight: screen.innerHeight,
        };

        Object.defineProperty(window, 'innerWidth', {
          get: () => mockWindow.innerWidth,
        });

        Object.defineProperty(window, 'innerHeight', {
          get: () => mockWindow.innerHeight,
        });

        service.screenMode = 'regular';
        const initialExtent = service.calculateInitialExtent();

        expect(Math.round(initialExtent.x)).toEqual(2672821);
        expect(Math.round(initialExtent.y)).toEqual(1253620);
        expect(Math.round(initialExtent.scale)).toEqual(520505);
      });
    });
    [
      {innerWidth: 400, innerHeight: 400},
      {innerWidth: 1000, innerHeight: 400},
      {innerWidth: 1000000, innerHeight: 400},
    ].forEach((screen) => {
      it(`should calculate the same center and scale for wide mobile screens with constant height. width/height: (${screen.innerWidth}px/${screen.innerHeight}px)`, () => {
        const mockWindow = {
          innerWidth: screen.innerWidth,
          innerHeight: screen.innerHeight,
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
        expect(Math.round(initialExtent.y)).toEqual(1251419);
        expect(Math.round(initialExtent.scale)).toEqual(1040071);
      });
    });
    [
      {innerWidth: 400, innerHeight: 700},
      {innerWidth: 400, innerHeight: 1000},
      {innerWidth: 400, innerHeight: 1000000},
    ].forEach((screen) => {
      it(`should calculate the same center and scale for high mobile screens with constant width. width/height: (${screen.innerWidth}px/${screen.innerHeight}px)`, () => {
        const mockWindow = {
          innerWidth: screen.innerWidth,
          innerHeight: screen.innerHeight,
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
        expect(Math.round(initialExtent.y)).toEqual(1252606);
        expect(Math.round(initialExtent.scale)).toEqual(478975);
      });
    });
  });
});
