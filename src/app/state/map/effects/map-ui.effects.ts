import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class MapUiEffects {
  public dispatchSetMapSideDrawerContentRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setMapSideDrawerContent),
      map((value) => {
        switch (value.mapSideDrawerContent) {
          case 'none':
            return MapUiActions.toggleAllUiElements({hideAllElements: false});
          case 'print':
            return MapUiActions.toggleAllUiElements({hideAllElements: true});
        }
      })
    );
  });

  constructor(private readonly actions$: Actions) {}
}
