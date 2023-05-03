import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, iif, of, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Store} from '@ngrx/store';
import {selectQueryLayers} from '../selectors/query-layers.selector';

@Injectable()
export class FeatureInfoEffects {
  public dispatchFeatureInfoRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      concatLatestFrom(() => this.store.select(selectQueryLayers)),
      switchMap(([action, queryLayers]) =>
        iif(
          () => queryLayers.length !== 0,
          this.topicsService.loadFeatureInfos(action.x, action.y, queryLayers).pipe(
            map((featureInfos) => {
              return FeatureInfoActions.updateFeatureInfo({featureInfos});
            }),
            catchError(() => EMPTY) // todo error handling
          ),
          of(FeatureInfoActions.updateFeatureInfo({featureInfos: []}))
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, private readonly topicsService: Gb3TopicsService, private readonly store: Store) {}
}
