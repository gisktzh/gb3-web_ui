import {Subject} from 'rxjs';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {AbstractEsriSelectionStrategy} from './abstract-esri-selection.strategy';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';

class PendingSelection extends AbstractEsriSelectionStrategy<DrawingCallbackHandler<'completeSelection'>> {
  public readonly pending = new Subject<DataDownloadSelection | undefined>();
  protected createSelection() {
    return this.pending;
  }
}

describe('selection subscription lifetime', () => {
  it('unsubscribes from delayed selection results on cancellation', () => {
    const layer = new GraphicsLayer();
    const complete = vi.fn();
    const strategy = new PendingSelection(layer, new SimpleFillSymbol(), complete);
    strategy.start();
    expect(strategy.pending.observed).toBe(true);
    strategy.cancel();
    expect(strategy.pending.observed).toBe(false);
    strategy.pending.next(undefined);
    expect(complete).not.toHaveBeenCalled();
    expect(layer.graphics.length).toBe(0);
  });
});
