import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingEffects} from './drawing.effects';
import {DrawingActions} from '../actions/drawing.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';

describe('DrawingEffects', () => {
  let actions$: Observable<Action>;
  let effects: DrawingEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DrawingEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(DrawingEffects);
  });

  describe('clearAllDrawingLayers$', () => {
    it('dispatches DrawingActions.clearDrawings()', (done: DoneFn) => {
      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());

      effects.clearAllDrawingLayers$.subscribe((action) => {
        expect(action).toEqual(DrawingActions.clearDrawings());
        done();
      });
    });
  });

  describe('clearSingleDrawingLayer$', () => {
    it('dispatches nothing if the removed item is not a drawing item', fakeAsync(async () => {
      const mockActiveMapItem: ActiveMapItem = createGb2WmsMapItemMock('Attack of the Gurkenbröters');

      let actualAction;
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: mockActiveMapItem}));
      effects.clearSingleDrawingLayer$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));

    it('dispatches DrawingActions.clearDrawingLayer with the correct DrawingLayer', (done: DoneFn) => {
      const mockActiveMapItem: ActiveMapItem = createDrawingMapItemMock(UserDrawingLayer.Measurements);
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: mockActiveMapItem}));

      effects.clearSingleDrawingLayer$.subscribe((action) => {
        expect(action).toEqual(DrawingActions.clearDrawingLayer({layer: UserDrawingLayer.Measurements}));
        done();
      });
    });
  });
});
