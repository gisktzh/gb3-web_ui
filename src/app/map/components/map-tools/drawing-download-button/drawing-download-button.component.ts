import {Component, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatIcon} from '@angular/material/icon';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import {DrawingDownloadDialogComponent} from '../drawing-download-dialog/drawing-download-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'drawing-download-button',
  imports: [MatIcon, MatTooltip, MatIconButton],
  templateUrl: './drawing-download-button.component.html',
  styleUrl: './drawing-download-button.component.scss',
})
export class DrawingDownloadButtonComponent {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);
  public readonly drawings = this.store.selectSignal(selectDrawings);
  public readonly hasDrawings = computed(() => this.drawings().length > 0);

  public openDownloadDialog() {
    this.dialogService.open(DrawingDownloadDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
    });
  }
}
