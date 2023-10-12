import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriMunicipalitySelectionStrategy} from './esri-municipality-selection.strategy';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {DataDownloadSelectMunicipalityDialogComponent} from '../../../../../components/data-download-select-municipality-dialog/data-download-select-municipality-dialog.component';
import {Municipality} from '../../../../../../shared/interfaces/geoshop-product.interface';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';
import {provideMockStore} from '@ngrx/store/testing';

describe('EsriMunicipalitySelectionStrategy', () => {
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  const callbackHandler: SelectionCallbackHandler = {
    complete: () => {},
    abort: () => {},
  };
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [provideMockStore({})],
    });
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
    dialog = TestBed.inject(MatDialog);
  });

  describe('cancellation', () => {
    it('does clear the layer and not dispatching anything', () => {
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const dialogSpy = spyOn(dialog, 'open');
      const strategy = new EsriMunicipalitySelectionStrategy(layer, fillSymbol, callbackHandler, dialog);
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
      expect(dialogSpy).not.toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('dispatches a new selection', fakeAsync(async () => {
      const expectedMunicipality: Municipality = {id: 'Loot', name: 'McGrabber'};
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const abortCallbackHandlerSpy = spyOn(callbackHandler, 'abort');
      const layerAddSpy = spyOn(layer, 'add');
      const dialogSpy = spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(expectedMunicipality),
      } as MatDialogRef<typeof DataDownloadSelectMunicipalityDialogComponent, Municipality>);
      const strategy = new EsriMunicipalitySelectionStrategy(layer, fillSymbol, callbackHandler, dialog);

      strategy.start();
      flush();

      expect(layerAddSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({type: 'select-municipality', municipality: expectedMunicipality}),
      );
      expect(abortCallbackHandlerSpy).not.toHaveBeenCalled();
    }));

    it('cancel the dialog without result', fakeAsync(async () => {
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const abortCallbackHandlerSpy = spyOn(callbackHandler, 'abort');
      const dialogSpy = spyOn(dialog, 'open').and.callThrough();
      const layerAddSpy = spyOn(layer, 'add');
      const strategy = new EsriMunicipalitySelectionStrategy(layer, fillSymbol, callbackHandler, dialog);
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.start();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
      expect(abortCallbackHandlerSpy).not.toHaveBeenCalled();

      dialog.closeAll();
      flush();

      expect(layerAddSpy).not.toHaveBeenCalled();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
      expect(abortCallbackHandlerSpy).toHaveBeenCalled();
    }));
  });
});
