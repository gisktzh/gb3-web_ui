import {Component, computed, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {selectId, selectSavingState} from '../../../state/map/reducers/share-link.reducer';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput, MatSuffix} from '@angular/material/input';
import {MatIconButton, MatButton} from '@angular/material/button';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';
import {FeatureFlagDirective} from '../../../shared/directives/feature-flag.directive';
import {MapOverlayListItemComponent} from '../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {HasSavingStateSingal} from 'src/app/shared/interfaces/has-saving-state-signal.interface';

@Component({
  selector: 'share-link-dialog',
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss'],
  imports: [
    ApiDialogWrapperComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    CdkCopyToClipboard,
    MatIcon,
    FeatureFlagDirective,
    MapOverlayListItemComponent,
    MatButton,
  ],
})
export class ShareLinkDialogComponent implements HasSavingStateSingal {
  private readonly dialogRef = inject<MatDialogRef<ShareLinkDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);

  public readonly savingState = this.store.selectSignal(selectSavingState);
  protected readonly shareLinkId = this.store.selectSignal(selectId);
  public readonly shareLinkUrl = computed(() => {
    const id = this.shareLinkId();
    if (!id) {
      return 'Generiere Link...';
    }

    const relativeShareLinkUrl = this.router.createUrlTree([MainPage.ShareLink, id]).toString();
    return new URL(relativeShareLinkUrl, globalThis.location.origin).toString();
  });
  public readonly iframeCode = computed(() => {
    const id = this.shareLinkId();
    if (!id) {
      return 'Generiere iframe Code zum einbetten...';
    }

    const relativeEmbeddedMapUrl = this.router.createUrlTree([MainPage.Embedded, id]).toString();
    const embeddedMapUrl = new URL(relativeEmbeddedMapUrl, globalThis.location.origin).toString();
    const embeddedMapConfig = this.configService.embeddedMapConfig;
    return (
      `<iframe src='${embeddedMapUrl}' title="${embeddedMapConfig.title}" width='${embeddedMapConfig.width}'` +
      ` height='${embeddedMapConfig.height}' style='border:${embeddedMapConfig.borderSize}'></iframe>`
    );
  });

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
