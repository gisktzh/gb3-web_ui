import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasSavingState} from '../../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {ConfigService} from '../../../../shared/services/config.service';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {filter, Subscription, tap} from 'rxjs';
import {selectId, selectSavingState} from '../../../../state/map/reducers/share-link.reducer';
import {map} from 'rxjs/operators';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

@Component({
  selector: 'share-link-content',
  templateUrl: './share-link-content.component.html',
  styleUrls: ['./share-link-content.component.scss'],
})
export class ShareLinkContentComponent implements OnInit, OnDestroy, HasSavingState {
  public shareLinkUrl?: string;
  public savingState: LoadingState = 'undefined';
  public iframeCode?: string;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly shareLinkId$ = this.store.select(selectId);
  private readonly savingState$ = this.store.select(selectSavingState);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(
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
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
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
