import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {PageNotificationActions} from '../actions/page-notification.actions';
import {PageNotification} from '../../../shared/interfaces/page-notification.interface';

import {PageNotificationsCouldNotBeLoaded} from '../../../shared/errors/app.errors';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';

@Injectable()
export class PageNotificationEffects {
  private readonly actions$ = inject(Actions);
  private readonly gravCmsService = inject<GravCmsService>(GRAV_CMS_SERVICE);

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
            throw new PageNotificationsCouldNotBeLoaded(err);
          }),
        ),
      ),
    );
  });
}
