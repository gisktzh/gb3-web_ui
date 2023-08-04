import {Component, OnInit} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {filter, from, Subscription, switchMap, tap} from 'rxjs';
import {ShareLinkActions} from '../../../state/map/actions/share-link.actions';
import {selectInitializeApplicationLoadingState, selectLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {LoadingState} from '../../../shared/types/loading-state';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

@Component({
  selector: 'share-link-redirect',
  templateUrl: './share-link-redirect.component.html',
  styleUrls: ['./share-link-redirect.component.scss'],
})
export class ShareLinkRedirectComponent implements OnInit {
  // expose the enum to the HTML
  public readonly mainPageEnum = MainPage;
  public id: string | null = null;
  public loadingState: LoadingState = 'undefined';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly initializeApplicationLoadingState$ = this.store.select(selectInitializeApplicationLoadingState);
  private readonly shareLinkLoadingState$ = this.store.select(selectLoadingState);
  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
    this.id = this.route.snapshot.paramMap.get(RouteParamConstants.RESOURCE_IDENTIFIER);
    if (this.id !== null) {
      this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnId({id: this.id}));
    } else {
      // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
      throw new ShareLinkParameterInvalid();
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.initializeApplicationLoadingState$
        .pipe(
          tap((loadingState) => (this.loadingState = loadingState)),
          filter((loadingState) => loadingState === 'error' || loadingState === 'loaded'),
          switchMap(() => {
            return from(this.router.navigate([MainPage.Maps]));
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.shareLinkLoadingState$
        .pipe(
          filter((loadingState) => loadingState === 'error'),
          switchMap(() => {
            return from(this.router.navigate([MainPage.Maps]));
          }),
        )
        .subscribe(),
    );
  }
}
