import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {selectId, selectSavingState} from 'src/app/state/map/reducers/share-link.reducer';
import {MatIconButton} from '@angular/material/button';
import {MatSuffix} from '@angular/material/input';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';

@Component({
  selector: 'share-link-mobile',
  templateUrl: './share-link-mobile.component.html',
  styleUrls: ['./share-link-mobile.component.scss'],
  imports: [MatIconButton, MatSuffix, CdkCopyToClipboard, MatIcon, LoadingAndProcessBarComponent],
})
export class ShareLinkMobileComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  public readonly savingState = this.store.selectSignal(selectSavingState);
  private readonly shareLinkId = this.store.selectSignal(selectId);
  public readonly shareLinkUrl = computed(() => {
    const id = this.shareLinkId();
    if (!id) {
      return undefined;
    }

    const relativeShareLinkUrl = this.router.createUrlTree([MainPage.ShareLink, id]).toString();
    return new URL(relativeShareLinkUrl, globalThis.location.origin).toString();
  });
}
