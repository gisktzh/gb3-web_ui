import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription, filter, map, tap} from 'rxjs';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
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
export class ShareLinkMobileComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  public shareLinkUrl?: string;
  public savingState: LoadingState = undefined;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly shareLinkId$ = this.store.select(selectId);
  private readonly savingState$ = this.store.select(selectSavingState);

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createShareLinkUrl(id: string, baseUrl: string): string {
    const relativeShareLinkUrl = this.router.createUrlTree([MainPage.ShareLink, id]).toString();
    return new URL(relativeShareLinkUrl, baseUrl).toString();
  }

  public initSubscriptions() {
    this.subscriptions.add(this.savingState$.pipe(tap((savingState) => (this.savingState = savingState))).subscribe());
    this.subscriptions.add(
      this.shareLinkId$
        .pipe(
          filter((id) => id !== undefined),
          map((id) => id!),
          tap((id) => {
            const baseUrl = window.location.origin;
            this.shareLinkUrl = this.createShareLinkUrl(id, baseUrl);
          }),
        )
        .subscribe(),
    );
  }
}
