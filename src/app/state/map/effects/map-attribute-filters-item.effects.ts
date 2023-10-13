import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {map} from 'rxjs';
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
      map(([__, screenMode]) => {
        if (screenMode === 'mobile') {
          return MapUiActions.showBottomSheet({bottomSheetContent: 'map-attributes'});
        } else {
          return MapUiActions.hideBottomSheet(); // TODO this is a placeholder
        }
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {}
}
