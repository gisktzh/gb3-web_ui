import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {filter, Subscription, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {selectId, selectSavingState} from '../../../state/map/reducers/share-link.reducer';
import {Router} from '@angular/router';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {map} from 'rxjs/operators';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
  selector: 'share-link-dialog',
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss'],
})
export class ShareLinkDialogComponent implements OnInit, OnDestroy, HasSavingState {
  public shareLinkUrl?: string;
  public iframeCode?: string;
  public savingState: LoadingState = 'undefined';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly shareLinkId$ = this.store.select(selectId);
  private readonly savingState$ = this.store.select(selectSavingState);

  constructor(
    private readonly dialogRef: MatDialogRef<ShareLinkDialogComponent>,
    private readonly store: Store,
    private readonly router: Router,
    private readonly configService: ConfigService,
  ) {}

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
