import {Component, OnDestroy, OnInit} from '@angular/core';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {DrawingStyleActions} from '../../../../state/map/actions/drawing-style.actions';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {selectDrawingStyleState} from '../../../../state/map/reducers/drawing-style.reducer';
import {first, Subscription, tap} from 'rxjs';
import {defaultFillColor, defaultLineColor, defaultLineWidth} from '../../../../shared/configs/drawing.config';

@Component({
  selector: 'drawing-settings-dialog',
  templateUrl: './drawing-settings-dialog.component.html',
  styleUrls: ['./drawing-settings-dialog.component.scss'],
})
export class DrawingSettingsDialogComponent implements OnInit, OnDestroy {
  public fillColor = ColorUtils.convertSymbolizationColorToHex(defaultFillColor).hexColor;
  public lineColor = ColorUtils.convertSymbolizationColorToHex(defaultLineColor).hexColor;
  public lineWidth = defaultLineWidth;
  private readonly drawingStyleState$ = this.store.select(selectDrawingStyleState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingSettingsDialogComponent>,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public cancel() {
    this.dialogRef.close();
  }

  public saveSettings() {
    const fillColor = ColorUtils.convertHexToSymbolizationColor(this.fillColor, defaultFillColor.a);
    const lineColor = ColorUtils.convertHexToSymbolizationColor(this.lineColor);

    this.store.dispatch(DrawingStyleActions.setDrawingStyles({fillColor, lineColor, lineWidth: this.lineWidth}));
    this.dialogRef.close();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.drawingStyleState$
        .pipe(
          first(),
          tap((drawingStyleState) => {
            this.fillColor = ColorUtils.convertSymbolizationColorToHex(drawingStyleState.fillColor).hexColor;
            this.lineColor = ColorUtils.convertSymbolizationColorToHex(drawingStyleState.lineColor).hexColor;
            this.lineWidth = drawingStyleState.lineWidth;
          }),
        )
        .subscribe(),
    );
  }
}
