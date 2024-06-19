import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs/operators';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {OverlayPrintActions} from '../actions/overlay-print-actions';
import {OverlayPrintEffects} from './overlay-print.effects';
import {selectPrintLegendItems} from '../selectors/print-legend-items.selector';
import {FeatureInfoPrintConfiguration, PrintableOverlayItem} from '../../../shared/interfaces/overlay-print.interface';
import {selectPrintFeatureInfoItems} from '../selectors/print-feature-info-items.selector';
import {FileDownloadService} from '../../../shared/services/file-download-service';

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
      imports: [HttpClientTestingModule],
      providers: [
        OverlayPrintEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
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
    let gb3PrintServiceSpy: jasmine.Spy;
    let mockPrintItems: PrintableOverlayItem[];

    beforeEach(() => {
      gb3PrintServiceSpy = spyOn(gb3PrintService, 'printLegend').and.returnValue(of(creationResponseMock));
      mockPrintItems = [{topic: 'test', layers: ['a', 'b']}];
      store.overrideSelector(selectPrintLegendItems, mockPrintItems);
    });

    it('dispatches OverlayPrintActions.setPrintRequestResponse() with the service response on success', (done: DoneFn) => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestLegendPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledOnceWith(mockPrintItems);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: creationResponseMock}));
        done();
      });
    });

    it('does nothing if print request is for feature info', fakeAsync(async () => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestLegendPrint$.subscribe();
      tick();

      expect(gb3PrintServiceSpy).not.toHaveBeenCalled();
    }));

    it('dispatches OverlayPrintActions.setPrintRequestError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('oh no! butterfingers');
      gb3PrintServiceSpy.and.returnValue(throwError(() => expectedError));

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestLegendPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error: expectedError}));
        done();
      });
    });
  });

  describe('requestFeatureInfoPrint$', () => {
    let gb3PrintServiceSpy: jasmine.Spy;
    let mockPrintConfiguration: FeatureInfoPrintConfiguration;

    beforeEach(() => {
      gb3PrintServiceSpy = spyOn(gb3PrintService, 'printFeatureInfo').and.returnValue(of(creationResponseMock));
      mockPrintConfiguration = {items: [{topic: 'test', layers: ['a', 'b']}], x: 25, y: 65};
      store.overrideSelector(selectPrintFeatureInfoItems, mockPrintConfiguration);
    });

    it('dispatches OverlayPrintActions.setPrintRequestResponse() with the service response on success', (done: DoneFn) => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledOnceWith(
          mockPrintConfiguration.items,
          mockPrintConfiguration.x,
          mockPrintConfiguration.y,
        );
        expect(action).toEqual(
          OverlayPrintActions.setPrintRequestResponse({
            overlay: 'featureInfo',
            creationResponse: creationResponseMock,
          }),
        );
        done();
      });
    });

    it('does nothing if print request is for legend', fakeAsync(async () => {
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
      effects.requestFeatureInfoPrint$.subscribe();
      tick();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if x is undefined', fakeAsync(async () => {
      store.overrideSelector(selectPrintFeatureInfoItems, {items: [], y: 5});
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe();
      tick();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if y is undefined', fakeAsync(async () => {
      store.overrideSelector(selectPrintFeatureInfoItems, {items: [], x: 5});
      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe();
      tick();

      expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(0);
    }));

    it('dispatches OverlayPrintActions.setPrintRequestError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('oh no! butterfingers');
      gb3PrintServiceSpy.and.returnValue(throwError(() => expectedError));

      actions$ = of(OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'}));
      effects.requestFeatureInfoPrint$.subscribe((action) => {
        expect(gb3PrintServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(OverlayPrintActions.setPrintRequestError({overlay: 'featureInfo', error: expectedError}));
        done();
      });
    });
  });

  describe('throwPrintRequestError$', () => {
    it('throws a PrintRequestCouldNotBeHandled error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error: expectedOriginalError}));
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
    it('opens a print document in a new tab, no further dispatch', (done: DoneFn) => {
      const expectedCreationResponse = creationResponseMock;
      const fileDownloadServiceSpy = spyOn(fileDownloadService, 'downloadFileFromUrl');
      const expectedAction = OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: expectedCreationResponse});

      actions$ = of(expectedAction);
      effects.downloadPrintDocument$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(fileDownloadServiceSpy).toHaveBeenCalledOnceWith(
          expectedCreationResponse.reportUrl,
          expectedCreationResponse.reportUrl.split('/').pop(),
        );
        done();
      });
    });
  });
});
