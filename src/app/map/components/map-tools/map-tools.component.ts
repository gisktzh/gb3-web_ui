import {Component, EventEmitter, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {ShareLinkDialogComponent} from '../share-link-dialog/share-link-dialog.component';

const SHARE_LINK_DIALOG_WIDTH = '657px';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent {
  @Output() public openPrintDialogEvent = new EventEmitter<void>();

  constructor(private readonly store: Store, private readonly dialogService: MatDialog) {}

  public showPrintDialog() {
    this.openPrintDialogEvent.emit();
  }

  public showShareLinkDialog() {
    this.dialogService.open(ShareLinkDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      width: SHARE_LINK_DIALOG_WIDTH
    });
  }
}
