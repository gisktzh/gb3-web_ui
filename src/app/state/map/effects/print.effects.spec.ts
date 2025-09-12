import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs';
import {PrintEffects} from './print.effects';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintActions} from '../actions/print.actions';
import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {FileDownloadService} from '../../../shared/services/file-download-service';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAP_SERVICE} from '../../../app.tokens';

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
            format: 'image/png; mode=8bit',
            transparent: true,
            dynamicStringParams: {
              myCustomParamOne: 'myCustomValue',
            },
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
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        PrintEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(PrintEffects);
    gb3PrintService = TestBed.inject(Gb3PrintService);
    fileDownloadService = TestBed.inject(FileDownloadService);

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
      const expectedOriginalError = 'oh no! butterfingers';

      actions$ = of(PrintActions.setPrintRequestError({error: expectedOriginalError}));
      effects.throwPrintRequestError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new PrintRequestCouldNotBeHandled(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('throws a PrintRequestCouldNotBeHandled error with translated original errors', (done: DoneFn) => {
      const originalErrors = {
        error: {
          errors: ['Invalid report name', 'Missing attributes', 'Invalid DPI for report Hello World'],
        },
      };

      const expectedTranslatedError =
        'Beim Drucken ist etwas schief gelaufen: Report-Name existiert nicht\nEs fehlen Angaben\nUngültiger DPI-Wert für Report Hello World';

      actions$ = of(PrintActions.setPrintRequestError({error: originalErrors}));
      effects.throwPrintRequestError$
        .pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- has to be `any` to allow for `.message`. Type `unknown` doesn't do that.
          catchError((error: any) => {
            expect(error.message).toEqual(expectedTranslatedError);
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
      const fileDownloadServiceSpy = spyOn(fileDownloadService, 'downloadFileFromUrl');

      actions$ = of(PrintActions.setPrintRequestResponse({creationResponse: expectedCreationResponse}));
      effects.downloadPrintDocument$.subscribe((action) => {
        expect(fileDownloadServiceSpy).toHaveBeenCalledOnceWith(
          expectedCreationResponse.reportUrl,
          expectedCreationResponse.reportUrl.split('/').pop(),
        );
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
