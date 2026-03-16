import type {Mock} from 'vitest';
import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {OverlayPrintActions} from '../actions/overlay-print-actions';
import {OverlayPrintEffects} from './overlay-print.effects';
import {selectPrintLegendItems} from '../selectors/print-legend-items.selector';
import {FeatureInfoPrintConfiguration, PrintableOverlayItem} from '../../../shared/interfaces/overlay-print.interface';
import {selectPrintFeatureInfoItems} from '../selectors/print-feature-info-items.selector';
import {FileDownloadService} from '../../../shared/services/file-download-service';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DRAWING_SYMBOLS_SERVICE, MAP_SERVICE} from '../../../app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';

describe('OverlayPrintEffects', () => {
  const creationResponseMock: PrintCreationResponse = {reportUrl: 'response url'};
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: OverlayPrintEffects;
  let gb3PrintService: Gb3PrintService;
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        OverlayPrintEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(OverlayPrintEffects);
    gb3PrintService = TestBed.inject(Gb3PrintService);
    fileDownloadService = TestBed.inject(FileDownloadService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('requestLegendPrint$', () => {
    let gb3PrintServiceSpy: Mock;
    let mockPrintItems: PrintableOverlayItem[];

    beforeEach(() => {
      gb3PrintServiceSpy = vi.spyOn(gb3PrintService, 'printLegend').mockReturnValue(of(creationResponseMock));
      mockPrintItems = [{topic: 'test', layers: ['a', 'b']}];
      store.overrideSelector(selectPrintLegendItems, mockPrintItems);
    });

    it('dispatches OverlayPrintActions.setPrintRequestResponse() with the service response on success', () => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestLegendPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3PrintServiceSpy).toHaveBeenCalledWith(mockPrintItems);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: creationResponseMock}));
      });
    });

    it('does nothing if print request is for feature info', async () => {
      vi.useFakeTimers();

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestLegendPrint$.subscribe();
      await vi.runAllTimersAsync();

      expect(gb3PrintServiceSpy).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('dispatches OverlayPrintActions.setPrintRequestError() with the error on failure', () => {
      const expectedError = new Error('oh no! butterfingers');
      gb3PrintServiceSpy.mockReturnValue(throwError(() => expectedError));

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestLegendPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error: expectedError}));
      });
    });
  });

  describe('requestFeatureInfoPrint$', () => {
    let gb3PrintServiceSpy: Mock;
    let mockPrintConfiguration: FeatureInfoPrintConfiguration;

    beforeEach(() => {
      gb3PrintServiceSpy = vi.spyOn(gb3PrintService, 'printFeatureInfo').mockReturnValue(of(creationResponseMock));
      mockPrintConfiguration = {items: [{topic: 'test', layers: ['a', 'b']}], x: 25, y: 65};
      store.overrideSelector(selectPrintFeatureInfoItems, mockPrintConfiguration);
    });

    it('dispatches OverlayPrintActions.setPrintRequestResponse() with the service response on success', () => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(gb3PrintServiceSpy).toHaveBeenCalledWith(mockPrintConfiguration.items, mockPrintConfiguration.x, mockPrintConfiguration.y);
        expect(action).toEqual(
          OverlayPrintActions.setPrintRequestResponse({
            overlay: 'featureInfo',
            creationResponse: creationResponseMock,
          }),
        );
      });
    });

    it('does nothing if print request is for legend', async () => {
      vi.useFakeTimers();

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestFeatureInfoPrint$.subscribe();
      await vi.runAllTimersAsync();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);

      vi.useRealTimers();
    });

    it('does nothing if x is undefined', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectPrintFeatureInfoItems, {items: [], y: 5});
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe();
      await vi.runAllTimersAsync();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);

      vi.useRealTimers();
    });

    it('does nothing if y is undefined', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectPrintFeatureInfoItems, {items: [], x: 5});
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe();
      await vi.runAllTimersAsync();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);

      vi.useRealTimers();
    });

    it('dispatches OverlayPrintActions.setPrintRequestError() with the error on failure', () => {
      const expectedError = new Error('oh no! butterfingers');
      gb3PrintServiceSpy.mockReturnValue(throwError(() => expectedError));

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestError({overlay: 'featureInfo', error: expectedError}));
      });
    });
  });

  describe('throwPrintRequestError$', () => {
    it('throws a PrintRequestCouldNotBeHandled error', () => {
      const expectedOriginalError = 'oh no! butterfingers';

      actions$ = of(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error: expectedOriginalError}));
      effects.throwPrintRequestError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new PrintRequestCouldNotBeHandled(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('throws a PrintRequestCouldNotBeHandled error with translated original errors', () => {
      const originalErrors = {
        error: {
          errors: ['Invalid report name', 'Missing attributes', 'Invalid DPI for report Hello World'],
        },
      };

      const expectedTranslatedError =
        'Beim Drucken ist etwas schief gelaufen: Report-Name existiert nicht\nEs fehlen Angaben\nUngültiger DPI-Wert für Report Hello World';

      actions$ = of(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error: originalErrors}));
      effects.throwPrintRequestError$
        .pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- has to be `any` to allow for `.message`. Type `unknown` doesn't do that.
          catchError((error: any) => {
            expect(error.message).toEqual(expectedTranslatedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('downloadPrintDocument$', () => {
    it('opens a print document in a new tab, no further dispatch', () => {
      const expectedCreationResponse = creationResponseMock;
      const fileDownloadServiceSpy = vi.spyOn(fileDownloadService, 'downloadFileFromUrl');
      const expectedAction = OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: expectedCreationResponse});

      actions$ = of(expectedAction);
      effects.downloadPrintDocument$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(fileDownloadServiceSpy).toHaveBeenCalledTimes(1);
        expect(fileDownloadServiceSpy).toHaveBeenCalledWith(
          expectedCreationResponse.reportUrl,
          expectedCreationResponse.reportUrl.split('/').pop(),
        );
      });
    });
  });
});
