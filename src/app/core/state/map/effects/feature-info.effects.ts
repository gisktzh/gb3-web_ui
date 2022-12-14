import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, from, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {Gb3TopicsService} from '../../../../shared/services/apis/gb3/gb3-topics.service';
import {Store} from '@ngrx/store';
import {LayersConfig} from '../../../../../assets/layers.config';

@Injectable()
export class FeatureInfoEffects {
  public dispatchFeatureInfoRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      switchMap((action) =>
        // todo: load layers from state once layers are added to state
        from(this.topicsService.loadFeatureInfo(action.x, action.y, LayersConfig)).pipe(
          map((featureInfos) => {
            return FeatureInfoActions.updateFeatureInfo({featureInfos});
          }),
          catchError(() => EMPTY)
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, private readonly topicsService: Gb3TopicsService, private readonly store: Store) {}
}
