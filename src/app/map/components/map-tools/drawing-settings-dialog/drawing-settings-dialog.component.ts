import {Component} from '@angular/core';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {DrawingStyleActions} from '../../../../state/map/actions/drawing-style.actions';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'drawing-settings-dialog',
  templateUrl: './drawing-settings-dialog.component.html',
  styleUrls: ['./drawing-settings-dialog.component.scss'],
})
export class DrawingSettingsDialogComponent {
  // todo: inital settings and two-way bindings
  // todo: typehints for event variables below

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingSettingsDialogComponent>,
  ) {}

  public changeFill(event: any) {
    const color = ColorUtils.convertHexToSymbolizationColor(event.target.value, 0.6); // todo: default style extraction
    this.store.dispatch(DrawingStyleActions.setFillColor({color}));
  }

  public changeLine(event: any) {
    const color = ColorUtils.convertHexToSymbolizationColor(event.target.value);

    this.store.dispatch(DrawingStyleActions.setLineColor({color}));
  }

  public changeWidth(event: any) {
    this.store.dispatch(DrawingStyleActions.setLineWidth({width: event.target.value}));
  }

  public close() {
    this.dialogRef.close();
  }
}
