import {Component, Inject} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {DrawingSettingsDialogComponent} from '../drawing-settings-dialog/drawing-settings-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {tap} from 'rxjs';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';

const DRAWING_SETTINGS_DIALOG_MAX_WIDTH = 420;

@Component({
  selector: 'drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent extends AbstractToolsComponent {
  public hasDrawings: boolean = false;

  private readonly drawings$ = this.store.select(selectDrawings);

  constructor(@Inject(Store) store: Store, @Inject(MatDialog) dialogService: MatDialog) {
    super(store, dialogService);
  }

  public togglePointDrawing() {
    this.toggleTool('draw-point');
  }

  public toggleLineDrawing() {
    this.toggleTool('draw-line');
  }

  public togglePolygonDrawing() {
    this.toggleTool('draw-polygon');
  }

  public toggleRectangleDrawing() {
    this.toggleTool('draw-rectangle');
  }

  public toggleCircleDrawing() {
    this.toggleTool('draw-circle');
  }

  public toggleTextDrawing() {
    this.toggleTool('draw-text');
  }

  public downloadDrawings() {
    this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat: 'geojson'}));
  }

  public openSettingsDialog() {
    this.dialogService.open(DrawingSettingsDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
      maxWidth: DRAWING_SETTINGS_DIALOG_MAX_WIDTH,
    });
  }

  protected override initSubscriptions() {
    super.initSubscriptions();
    this.subscriptions.add(this.drawings$.pipe(tap((drawings) => (this.hasDrawings = drawings.length > 0))).subscribe());
  }
}
