import {AfterViewInit, Component} from '@angular/core';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {PrintDialogComponent} from '../print-dialog/print-dialog.component';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent implements AfterViewInit {
  constructor(private readonly store: Store, private readonly dialogService: MatDialog) {}

  public showPrintDialog() {
    this.dialogService.open(PrintDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false
    });
  }

  public ngAfterViewInit() {
    this.showPrintDialog();
  }
}
