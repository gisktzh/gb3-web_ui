import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {filter, from, Subscription, switchMap} from 'rxjs';
import {ShareLinkActions} from '../../../state/map/actions/share-link.actions';
import {selectApplicationInitializationLoadingState, selectLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

@Component({
  selector: 'share-link-redirect',
  templateUrl: './share-link-redirect.component.html',
  styleUrls: ['./share-link-redirect.component.scss'],
  standalone: false,
})
export class ShareLinkRedirectComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  public id: string | null = null;

  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly applicationInitializationLoadingState$ = this.store.select(selectApplicationInitializationLoadingState);
  private readonly shareLinkLoadingState$ = this.store.select(selectLoadingState);

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
      this.applicationInitializationLoadingState$
        .pipe(
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
