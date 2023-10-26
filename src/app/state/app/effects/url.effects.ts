import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UrlActions} from '../actions/url.actions';
import {map} from 'rxjs/operators';
import {routerCancelAction, routerNavigatedAction} from '@ngrx/router-store';
import {Router} from '@angular/router';
import {UrlUtils} from '../../../shared/utils/url.utils';
import {ConfigService} from '../../../shared/services/config.service';

@Injectable()
export class UrlEffects {
  public extractMainPageFromUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction, routerCancelAction),
      map((value) => {
        const urlTree = this.router.parseUrl(value.payload.routerState.url);
        const urlSegments = UrlUtils.extractUrlSegments(urlTree);
        const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(urlSegments);
        const mainPage = UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
        const isSimplifiedPage = mainPage !== undefined && this.configService.pageConfig.useSimplifiedPageOn.includes(mainPage);
        const segmentPaths: string[] = urlSegments.map((segment) => segment.path);
        const isHeadlessPage = this.configService.pageConfig.useHeadlessPageOn.some((headlessPagePaths) =>
          UrlUtils.containsSegmentPaths([headlessPagePaths], segmentPaths),
        );

        return UrlActions.setPage({mainPage, isSimplifiedPage, isHeadlessPage});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly configService: ConfigService,
  ) {}
}
