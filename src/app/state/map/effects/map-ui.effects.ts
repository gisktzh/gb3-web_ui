import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';
import {MapUiActions} from '../actions/map-ui.actions';
import {LegendActions} from '../actions/legend.actions';

@Injectable()
export class MapUiEffects {
  public dispatchSetMapSideDrawerContentRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setMapSideDrawerContent),
      map((value) => {
        switch (value.mapSideDrawerContent) {
          case 'none':
            return MapUiActions.changeUiElementsVisibility({hideAllUiElements: false, hideUiToggleButton: false});
          case 'print':
            return MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: true});
        }
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
