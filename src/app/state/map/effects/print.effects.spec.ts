import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs/operators';
import {PrintEffects} from './print.effects';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintActions} from '../actions/print.actions';
import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../actions/map-ui.actions';

describe('PrintEffects', () => {
  const creationMock: PrintCreation = {
    reportType: 'standard',
    format: 'tschif',
    reportLayout: 'mobile',
    reportOrientation: 'portrait',
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

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PrintEffects, provideMockActions(() => actions$), provideMockStore(), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    effects = TestBed.inject(PrintEffects);
    gb3PrintService = TestBed.inject(Gb3PrintService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
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

  describe('downloadPrintDocument$', () => {
    it('opens a print document in a new tab and dispatches a clearPrintRequest action', (done: DoneFn) => {
      const expectedCreationResponse = creationResponseMock;
      const documentWindowOpenSpy = spyOn(document.defaultView!.window, 'open').and.returnValue(null);

      actions$ = of(PrintActions.setPrintRequestResponse({creationResponse: expectedCreationResponse}));
      effects.downloadPrintDocument$.subscribe((action) => {
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

  describe('removePrintPreviewAfterClosingSideDrawer$', () => {
    it('dispatches PrintActions.setPrintRequestError() after closing the side drawer', (done: DoneFn) => {
      const expected = PrintActions.removePrintPreview();

      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.removePrintPreviewAfterClosingSideDrawer$.subscribe((action) => {
        expect(action).toEqual(expected);
        done();
      });
    });
  });
});
