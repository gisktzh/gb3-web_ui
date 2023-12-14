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
  // todo GB3-826: inital settings and two-way bindings
  // todo GB3-826: typehints for event variables below

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
    console.log(this.lineWidth);
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public changeFill(newColor: string) {
    const color = ColorUtils.convertHexToSymbolizationColor(newColor, 0.6); // todo GB3-826: default style extraction
    console.log(color);
    this.store.dispatch(DrawingStyleActions.setFillColor({color}));
  }

  public changeLine(newColor: string) {
    const color = ColorUtils.convertHexToSymbolizationColor(newColor);

    this.store.dispatch(DrawingStyleActions.setLineColor({color}));
  }

  public changeWidth(width: number) {
    console.log('methode', width);
    this.store.dispatch(DrawingStyleActions.setLineWidth({width}));
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.drawingStyleState$
        .pipe(
          first(),
          tap((drawingStyleState) => {
            console.log(drawingStyleState.fillColor);
            this.fillColor = ColorUtils.convertSymbolizatioColorToHex(drawingStyleState.fillColor);
            this.lineColor = ColorUtils.convertSymbolizatioColorToHex(drawingStyleState.lineColor);
            this.lineWidth = drawingStyleState.lineWidth;
          }),
        )
        .subscribe(),
    );
  }
}
