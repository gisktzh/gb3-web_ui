import {Component, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {WaitingPageComponent} from '../../../shared/components/waiting-page/waiting-page.component';
import {SessionStorageService} from '../../../shared/services/session-storage.service';

@Component({
  selector: 'share-link-redirect',
  templateUrl: './share-link-redirect.component.html',
  styleUrls: ['./share-link-redirect.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [WaitingPageComponent],
})
export class ShareLinkRedirectComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionStorageService = inject(SessionStorageService);
  public readonly id = signal(this.route.snapshot.paramMap.get(RouteParamConstants.RESOURCE_IDENTIFIER));

  protected readonly mainPageEnum = MainPage;

  constructor() {
    const id = this.id();
    if (id === null) {
      throw new ShareLinkParameterInvalid();
    }

    this.sessionStorageService.set(RouteParamConstants.SHARE_LINK_ID_SESSION_STORAGE_KEY, id);
    void this.router.navigate([MainPage.Maps], {replaceUrl: true});
  }
}
