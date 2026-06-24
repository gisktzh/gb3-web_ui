import {Component, effect, inject, signal} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {ShareLinkActions} from '../../../state/map/actions/share-link.actions';
import {selectApplicationInitializationLoadingState, selectLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {WaitingPageComponent} from '../../../shared/components/waiting-page/waiting-page.component';

@Component({
  selector: 'share-link-redirect',
  templateUrl: './share-link-redirect.component.html',
  styleUrls: ['./share-link-redirect.component.scss'],
  imports: [WaitingPageComponent],
})
export class ShareLinkRedirectComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  public readonly applicationInitializationLoadingState = this.store.selectSignal(selectApplicationInitializationLoadingState);
  public readonly shareLinkLoadingState = this.store.selectSignal(selectLoadingState);
  public readonly id = signal(this.route.snapshot.paramMap.get(RouteParamConstants.RESOURCE_IDENTIFIER));

  protected readonly mainPageEnum = MainPage;

  constructor() {
    const id = this.id();
    if (id === null) {
      throw new ShareLinkParameterInvalid();
    }

    this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnId({id}));

    effect(() => {
      const loadingState = this.applicationInitializationLoadingState();

      if (loadingState === 'error' || loadingState === 'loaded') {
        this.router.navigate([MainPage.Maps]);
      }
    });

    effect(() => {
      const loadingState = this.shareLinkLoadingState();

      if (loadingState === 'error') {
        this.router.navigate([MainPage.Maps]);
      }
    });
  }
}
