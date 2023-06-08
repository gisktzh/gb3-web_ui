import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ActiveMapItem} from '../../models/active-map-item.model';

@Component({
  selector: 'map-notice-dialog',
  templateUrl: './map-notice-dialog.component.html',
  styleUrls: ['./map-notice-dialog.component.scss']
})
export class MapNoticeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly activeMapItems: ActiveMapItem[],
    private readonly dialogRef: MatDialogRef<MapNoticeDialogComponent>
  ) {}

  public close() {
    this.dialogRef.close();
  }
}
