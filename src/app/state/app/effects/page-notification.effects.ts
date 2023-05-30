import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {PageNotificationActions} from '../actions/page-notification.actions';
import {PageNotification} from '../../../shared/interfaces/page-notification.interface';
import {GRAV_CMS_SERVICE} from '../../../app.module';

@Injectable()
export class PageNotificationEffects {
  public dispatchLoadPageNotifications$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PageNotificationActions.loadPageNotifications),
      switchMap(() =>
        this.gravCmsService.loadPageInfosData().pipe(
          map((pageNotifications) => {
            const pageNotificationMap: {[id: string]: PageNotification} = {};
            pageNotifications.forEach((pageNotification) => {
              pageNotificationMap[pageNotification.id] = pageNotification;
            });
            return PageNotificationActions.setPageNotifications({pageNotifications});
          }),
          catchError((err: unknown) => {
            if (!environment.production) {
              console.error(err);
            }
            return EMPTY; // todo error handling
          })
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, @Inject(GRAV_CMS_SERVICE) private readonly gravCmsService: GravCmsService) {}
}
