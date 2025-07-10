import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription, filter, map, tap} from 'rxjs';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectId, selectSavingState} from '../../../state/map/reducers/share-link.reducer';

@Component({
  selector: 'share-link-dialog',
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss'],
  standalone: false,
})
export class ShareLinkDialogComponent implements OnInit, OnDestroy, HasSavingState {
  private readonly dialogRef = inject<MatDialogRef<ShareLinkDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);

  public savingState: LoadingState = undefined;
  public shareLinkUrl?: string;
  public iframeCode?: string;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly savingState$ = this.store.select(selectSavingState);
  private readonly shareLinkId$ = this.store.select(selectId);

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
            this.iframeCode = this.createIFrameCode(id, baseUrl);
          }),
        )
        .subscribe(),
    );
  }

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }

  private createShareLinkUrl(id: string, baseUrl: string): string {
    const relativeShareLinkUrl = this.router.createUrlTree([MainPage.ShareLink, id]).toString();
    return new URL(relativeShareLinkUrl, baseUrl).toString();
  }

  private createIFrameCode(id: string, baseUrl: string): string {
    const relativeEmbeddedMapUrl = this.router.createUrlTree([MainPage.Embedded, id]).toString();
    const embeddedMapUrl = new URL(relativeEmbeddedMapUrl, baseUrl).toString();
    const embeddedMapConfig = this.configService.embeddedMapConfig;
    return (
      `<iframe src='${embeddedMapUrl}' title="${embeddedMapConfig.title}" width='${embeddedMapConfig.width}'` +
      ` height='${embeddedMapConfig.height}' style='border:${embeddedMapConfig.borderSize}'></iframe>`
    );
  }
}
