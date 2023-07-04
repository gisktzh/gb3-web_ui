import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';
import {MapUiActions} from '../actions/map-ui.actions';
import {LegendActions} from '../actions/legend.actions';

@Injectable()
export class MapUiEffects {
  public dispatchShowMapSideDrawerContentRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      map((value) => {
        switch (value.mapSideDrawerContent) {
          case 'print':
            return MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: true});
        }
      })
    );
  });

  public dispatchHideMapSideDrawerContentRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => {
        return MapUiActions.changeUiElementsVisibility({hideAllUiElements: false, hideUiToggleButton: false});
      })
    );
  });

  public dispatchShowLegendRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showLegend),
      map(() => {
        return LegendActions.loadLegend();
      })
    );
  });

  constructor(private readonly actions$: Actions) {}
}
