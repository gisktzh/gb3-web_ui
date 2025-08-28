import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {DrawingStyleActions} from '../../../../state/map/actions/drawing-style.actions';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {selectDrawingStyleState} from '../../../../state/map/reducers/drawing-style.reducer';
import {first, Subscription, tap} from 'rxjs';
import {ConfigService} from '../../../../shared/services/config.service';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {SliderEditComponent} from '../../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../../drawing-edit-overlay/drawing-edit/color-picker-edit/color-picker-edit.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'drawing-settings-dialog',
  templateUrl: './drawing-settings-dialog.component.html',
  styleUrls: ['./drawing-settings-dialog.component.scss'],
  imports: [ApiDialogWrapperComponent, SliderEditComponent, ColorPickerEditComponent, MatButton],
})
export class DrawingSettingsDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingSettingsDialogComponent>>(MatDialogRef);
  private readonly configService = inject(ConfigService);

  public fillColor = ColorUtils.convertSymbolizationColorToHex(this.configService.drawingConfig.defaultFillColor).hexColor;
  public lineColor = ColorUtils.convertSymbolizationColorToHex(this.configService.drawingConfig.defaultLineColor).hexColor;
  public lineWidth = this.configService.drawingConfig.defaultLineWidth;
  private readonly drawingStyleState$ = this.store.select(selectDrawingStyleState);
  private readonly subscriptions: Subscription = new Subscription();

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
    const fillColor = ColorUtils.convertHexToSymbolizationColor(this.fillColor, this.configService.drawingConfig.defaultFillColor.a);
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
