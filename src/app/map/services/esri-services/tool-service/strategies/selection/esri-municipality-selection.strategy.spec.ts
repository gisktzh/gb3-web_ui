import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriMunicipalitySelectionStrategy} from './esri-municipality-selection.strategy';
import {TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {provideMockStore} from '@ngrx/store/testing';
import {ConfigService} from '../../../../../../shared/services/config.service';
import {Gb3GeoshopMunicipalitiesService} from '../../../../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {Municipality} from '../../../../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadSelectMunicipalityDialogComponent} from '../../../../../components/map-tools/data-download-select-municipality-dialog/data-download-select-municipality-dialog.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MinimalGeometriesUtils} from '../../../../../../testing/map-testing/minimal-geometries.utils';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('EsriMunicipalitySelectionStrategy', () => {
  const callbackHandler = {
    handle: (selection: DataDownloadSelection | undefined) => {
      return selection;
    },
  };
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  let dialog: MatDialog;
  let configService: ConfigService;
  let geoshopMunicipalitiesService: Gb3GeoshopMunicipalitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [provideMockStore({}), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
    dialog = TestBed.inject(MatDialog);
    configService = TestBed.inject(ConfigService);
    geoshopMunicipalitiesService = TestBed.inject(Gb3GeoshopMunicipalitiesService);
  });

  describe('cancellation', () => {
    it('does clear the layer and does not dispatch anything', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const dialogSpy = vi.spyOn(dialog, 'open');
      const strategy = new EsriMunicipalitySelectionStrategy(
        layer,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        dialog,
        configService,
        geoshopMunicipalitiesService,
      );
      const layerRemoveAllSpy = vi.spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();
      expect(dialogSpy).not.toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('dispatches a new selection', async () => {
      vi.useFakeTimers();
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const expectedMunicipality: Municipality = {bfsNo: 1337, name: 'McGrabber'};
      const layerAddSpy = vi.spyOn(layer, 'add');
      const dialogSpy = vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(expectedMunicipality),
      } as MatDialogRef<typeof DataDownloadSelectMunicipalityDialogComponent, Municipality>);
      const geoshopMunicipalitiesServiceSpy = vi.spyOn(geoshopMunicipalitiesService, 'loadMunicipalityWithGeometry').mockReturnValue(
        of({
          ...expectedMunicipality,
          boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056),
        }),
      );
      const strategy = new EsriMunicipalitySelectionStrategy(
        layer,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        dialog,
        configService,
        geoshopMunicipalitiesService,
      );

      strategy.start();
      await vi.runAllTimersAsync();

      expect(layerAddSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledWith(expect.objectContaining({type: 'municipality', municipality: expectedMunicipality}));
      expect(geoshopMunicipalitiesServiceSpy).toHaveBeenCalledWith(expectedMunicipality.bfsNo);

      vi.useRealTimers();
    });

    it('cancels the dialog without result', async () => {
      vi.useFakeTimers();
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const dialogSpy = vi.spyOn(dialog, 'open');
      const layerAddSpy = vi.spyOn(layer, 'add');
      const strategy = new EsriMunicipalitySelectionStrategy(
        layer,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        dialog,
        configService,
        geoshopMunicipalitiesService,
      );
      const layerRemoveAllSpy = vi.spyOn(layer, 'removeAll');

      strategy.start();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();

      dialog.closeAll();
      await vi.runAllTimersAsync();

      expect(layerAddSpy).not.toHaveBeenCalled();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledWith(undefined);

      vi.useRealTimers();
    });
  });
});
