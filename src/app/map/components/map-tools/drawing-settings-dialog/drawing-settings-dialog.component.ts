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
  public fillColor: string = ColorUtils.convertSymbolizatioColorToHex(defaultFillColor);
  public lineColor: string = ColorUtils.convertSymbolizatioColorToHex(defaultLineColor);
  public lineWidth: number = defaultLineWidth;
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
    this.changeFill(this.fillColor);
    this.changeLine(this.lineColor);
    this.changeWidth(this.lineWidth);
    this.dialogRef.close();
  }

  private changeFill(newColor: string) {
    const color = ColorUtils.convertHexToSymbolizationColor(newColor, defaultFillColor.a);
    this.store.dispatch(DrawingStyleActions.setFillColor({color}));
  }

  private changeLine(newColor: string) {
    const color = ColorUtils.convertHexToSymbolizationColor(newColor);
    this.store.dispatch(DrawingStyleActions.setLineColor({color}));
  }

  private changeWidth(width: number) {
    this.store.dispatch(DrawingStyleActions.setLineWidth({width}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.drawingStyleState$
        .pipe(
          first(),
          tap((drawingStyleState) => {
            this.fillColor = ColorUtils.convertSymbolizatioColorToHex(drawingStyleState.fillColor);
            this.lineColor = ColorUtils.convertSymbolizatioColorToHex(drawingStyleState.lineColor);
            this.lineWidth = drawingStyleState.lineWidth;
          }),
        )
        .subscribe(),
    );
  }
}
