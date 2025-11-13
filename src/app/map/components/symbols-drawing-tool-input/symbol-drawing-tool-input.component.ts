import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogRef, MatDialogClose} from '@angular/material/dialog';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatButton} from '@angular/material/button';
import {DrawingSymbolsComponent} from '../drawing-symbols/drawing-symbols.component';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';

@Component({
  selector: 'symbol-drawing-tool-input',
  templateUrl: './symbol-drawing-tool-input.component.html',
  styleUrls: ['./symbol-drawing-tool-input.component.scss'],
  imports: [ApiDialogWrapperComponent, FormsModule, ReactiveFormsModule, MatButton, MatDialogClose, DrawingSymbolsComponent],
})
export class SymbolDrawingToolInputComponent {
  private readonly dialogRef =
    inject<MatDialogRef<SymbolDrawingToolInputComponent, {webStyleSymbol: WebStyleSymbol; size: number; rotation: number}>>(MatDialogRef);
  public webStyleSymbol!: WebStyleSymbol;
  public size: number = 10;
  public rotation: number = 0;

  public close() {
    this.dialogRef.close();
  }

  public onSymbolChange(value: WebStyleSymbol) {
    this.webStyleSymbol = value;
  }

  public onSizeChange(value: number) {
    this.size = value;
  }

  public onRotationChange(value: number) {
    this.rotation = value;
  }
}
