import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Injectable} from '@angular/core';
import {filter, map} from 'rxjs';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';

@Injectable()
export class MapAttributeFiltersItemEffects {
  public showMapAttributes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([, screenMode]) => screenMode === 'mobile'),
      map(() => {
        return MapUiActions.showBottomSheet({bottomSheetContent: 'map-attributes'});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {}
}
