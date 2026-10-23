import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import {MapNoticesService} from '../../services/map-notices.service';
import {ONBOARDING_STEPS, OnboardingGuideService} from 'src/app/onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from 'src/app/onboarding-guide/data/map-onboarding-guide.config';

@Component({
  selector: 'map-notice-dialog',
  templateUrl: './map-notice-dialog.component.html',
  styleUrls: ['./map-notice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [OnboardingGuideService, MapNoticesService, {provide: ONBOARDING_STEPS, useValue: mapOnboardingGuideConfig}],
  imports: [ApiDialogWrapperComponent, MatDivider, MatButton],
})
export class MapNoticeDialogComponent {
  protected readonly activeMapItemsWithNotices = inject<Gb2WmsActiveMapItem[]>(MAT_DIALOG_DATA);
  protected readonly mapNoticesService = inject(MapNoticesService);
  private readonly dialogRef = inject<MatDialogRef<MapNoticeDialogComponent>>(MatDialogRef);

  public close() {
    this.dialogRef.close();
  }

  public closeAndDisableAutoOpening() {
    this.mapNoticesService.disableAutoOpening();
    this.close();
  }

  public enableAutoOpening() {
    this.mapNoticesService.enableAutoOpening();
  }
}
