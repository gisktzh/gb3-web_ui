import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';

@Component({
  selector: 'map-notice-dialog',
  templateUrl: './map-notice-dialog.component.html',
  styleUrls: ['./map-notice-dialog.component.scss'],
  standalone: false,
})
export class MapNoticeDialogComponent {
  protected readonly activeMapItemsWithNotices = inject<Gb2WmsActiveMapItem[]>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<MapNoticeDialogComponent>>(MatDialogRef);

  public close() {
    this.dialogRef.close();
  }
}
