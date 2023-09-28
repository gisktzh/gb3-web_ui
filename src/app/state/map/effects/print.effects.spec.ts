import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {catchError} from 'rxjs/operators';
import {ErrorHandler} from '@angular/core';
import {PrintEffects} from './print.effects';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintActions} from '../actions/print.actions';
import {PrintCapabilities, PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintInfoCouldNotBeLoaded, PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {selectCapabilities} from '../reducers/print.reducer';
import {MapDrawingService} from '../../../map/services/map-drawing.service';

describe('PrintEffects', () => {
  const capabilitiesMock: PrintCapabilities = {
    formats: ['pdf', 'png', 'tif', 'gif'],
    dpis: [300, 150],
    reports: [
      {
        layout: 'A4',
        orientation: 'hoch',
        map: {
          width: 520,
          height: 660,
        },
      },
      {
        layout: 'Kartenset',
        orientation: undefined,
        map: {
          width: 520,
          height: 660,
        },
      },
    ],
  };
  const creationMock: PrintCreation = {
    format: 'tschif',
    reportLayout: 'mobile',
    reportOrientation: 'hoch',
    attributes: {
      reportTitle: 'Passierschein a38',
      userTitle: 'Haus, das Verrückte macht',
      userComment: 'Die Spinnen, die Römer',
      showLegend: true,
    },
    map: {
      dpi: 9001,
      rotation: 42,
      scale: 123_456_789,
      center: [12.3, 45.6],
      mapItems: [
        {
          type: 'WMS',
          mapTitle: 'karte 1',
          customParams: {
            myCustomParamOne: 'myCustomValue',
          },
          background: false,
          layers: ['gott', 'würfelt', 'nicht'],
          url: 'url 1',
          opacity: 0.666,
        },
      ],
    },
  };
  const creationResponseMock: PrintCreationResponse = {reportUrl: 'response url'};

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: PrintEffects;
  let gb3PrintService: Gb3PrintService;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        PrintEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: ErrorHandler, useValue: errorHandlerMock},
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(PrintEffects);
    gb3PrintService = TestBed.inject(Gb3PrintService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadPrintCapabilities$', () => {
    it('dispatches PrintActions.setPrintCapabilities() with the service response on success', (done: DoneFn) => {
      const expectedCapabilities = capabilitiesMock;
      const gb3PrintServiceSpy = spyOn(gb3PrintService, 'loadPrintCapabilities').and.returnValue(of(expectedCapabilities));

      actions$ = of(PrintActions.loadPrintCapabilities());
      effects.loadPrintCapabilities$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(PrintActions.setPrintCapabilities({capabilities: expectedCapabilities}));
        done();
      });
    });

    it('dispatches PrintActions.setPrintCapabilitiesError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('oh no! butterfingers');
      const gb3PrintServiceSpy = spyOn(gb3PrintService, 'loadPrintCapabilities').and.returnValue(throwError(() => expectedError));

      actions$ = of(PrintActions.loadPrintCapabilities());
      effects.loadPrintCapabilities$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(PrintActions.setPrintCapabilitiesError({error: expectedError}));
        done();
      });
    });

    it('dispatches nothing if the capabilities are already in the store', fakeAsync(async () => {
      const expectedCapabilities = capabilitiesMock;
      store.overrideSelector(selectCapabilities, expectedCapabilities);
      const gb3PrintServiceSpy = spyOn(gb3PrintService, 'loadPrintCapabilities').and.returnValue(
        of({
          formats: ['blub'],
          dpis: [123, 456],
          reports: [],
        }),
      );

      actions$ = of(PrintActions.loadPrintCapabilities());
      effects.loadPrintCapabilities$.subscribe();
      tick();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);
      store.select(selectCapabilities).subscribe((capabilities) => {
        expect(capabilities).toEqual(expectedCapabilities);
      });
      tick();
    }));
  });

  describe('throwPrintCapabilitiesError$', () => {
    it('throws a PrintInfoCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(PrintActions.setPrintCapabilitiesError({error: expectedOriginalError}));
      effects.throwPrintCapabilitiesError$
        .pipe(
          catchError((error) => {
            const expectedError = new PrintInfoCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('setPrintCreationAfterSuccessfullyLoading$', () => {
    it('dispatches PrintActions.setPrintRequestResponse() with the service response on success', (done: DoneFn) => {
      const expectedCreation = creationMock;
      const expectedCreationResponse = creationResponseMock;
      const gb3PrintServiceSpy = spyOn(gb3PrintService, 'createPrintJob').and.returnValue(of(expectedCreationResponse));

      actions$ = of(PrintActions.requestPrintCreation({creation: expectedCreation}));
      effects.requestPrintCreation$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledOnceWith(expectedCreation);
        expect(action).toEqual(PrintActions.setPrintRequestResponse({creationResponse: expectedCreationResponse}));
        done();
      });
    });

    it('dispatches PrintActions.setPrintRequestError() with the error on failure', (done: DoneFn) => {
      const expectedCreation = creationMock;
      const expectedError = new Error('oh no! butterfingers');
      const gb3PrintServiceSpy = spyOn(gb3PrintService, 'createPrintJob').and.returnValue(throwError(() => expectedError));

      actions$ = of(PrintActions.requestPrintCreation({creation: expectedCreation}));
      effects.requestPrintCreation$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledOnceWith(expectedCreation);
        expect(action).toEqual(PrintActions.setPrintRequestError({error: expectedError}));
        done();
      });
    });
  });

  describe('throwPrintRequestError$', () => {
    it('throws a PrintRequestCouldNotBeHandled error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(PrintActions.setPrintRequestError({error: expectedOriginalError}));
      effects.throwPrintRequestError$
        .pipe(
          catchError((error) => {
            const expectedError = new PrintRequestCouldNotBeHandled(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('openPrintDocumentInNewTab$', () => {
    it('opens a print document in a new tab and dispatches a clearPrintRequest action', (done: DoneFn) => {
      const expectedCreationResponse = creationResponseMock;
      const documentWindowOpenSpy = spyOn(document.defaultView!.window, 'open').and.returnValue(null);

      actions$ = of(PrintActions.setPrintRequestResponse({creationResponse: expectedCreationResponse}));
      effects.openPrintDocumentInNewTab$.subscribe((action) => {
        expect(documentWindowOpenSpy).toHaveBeenCalledOnceWith(expectedCreationResponse.reportUrl, '_blank');
        expect(action).toEqual(PrintActions.clearPrintRequest());
        done();
      });
    });
  });

  describe('startDrawPrintPreview$', () => {
    it('starts drawing the print preview (no further actions are called)', (done: DoneFn) => {
      const printPreviewParametersMock = {height: 1, width: 2, scale: 3, rotation: 4};
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'startDrawPrintPreview').and.callThrough();

      actions$ = of(PrintActions.showPrintPreview(printPreviewParametersMock));
      effects.startDrawPrintPreview$.subscribe(() => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('removePrintPreview$', () => {
    it('stops drawing the print preview (no further actions are called)', (done: DoneFn) => {
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'stopDrawPrintPreview').and.callThrough();

      actions$ = of(PrintActions.removePrintPreview());
      effects.removePrintPreview$.subscribe(() => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
