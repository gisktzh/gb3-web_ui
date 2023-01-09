import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ActiveTopicActions} from '../actions/active-topic.actions';
import {MapService} from '../../../../map/services/map.service';
import {tap} from 'rxjs';

@Injectable()
export class ActiveTopicEffects {
  public dispatchActiveTopicAddEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveTopicActions.addActiveTopic),
        tap((action) => {
          this.mapService.addTopic(action.topic);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveTopicRemoveEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveTopicActions.removeActiveTopic),
        tap((action) => {
          this.mapService.removeTopic(action.topic);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveTopicClearEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveTopicActions.removeAllActiveTopics),
        tap((action) => {
          this.mapService.removeAllTopics();
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, private readonly mapService: MapService) {}
}
