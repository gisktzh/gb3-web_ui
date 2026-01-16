import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogRef, MatDialogClose} from '@angular/material/dialog';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatButton} from '@angular/material/button';
import {DrawingSymbolsComponent} from '../drawing-symbols/drawing-symbols.component';
import {SymbolStyleConstants} from 'src/app/shared/constants/symbol-style.constants';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

@Component({
  selector: 'symbol-drawing-tool-input',
  templateUrl: './symbol-drawing-tool-input.component.html',
  styleUrls: ['./symbol-drawing-tool-input.component.scss'],
  imports: [ApiDialogWrapperComponent, FormsModule, ReactiveFormsModule, MatButton, MatDialogClose, DrawingSymbolsComponent],
})
export class SymbolDrawingToolInputComponent {
  private readonly dialogRef = inject<MatDialogRef<SymbolDrawingToolInputComponent, SymbolDrawingToolInputComponent>>(MatDialogRef);
  public drawingSymbolDefinition!: DrawingSymbolDefinition;
  public size: number = SymbolStyleConstants.DEFAULT_SYMBOL_SIZE;
  public rotation: number = SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION;

  public close() {
    this.dialogRef.close();
  }

  public onSymbolChange(value: DrawingSymbolDefinition) {
    this.drawingSymbolDefinition = value;
  }

  public onSizeChange(value: number) {
    this.size = value;
  }

  public onRotationChange(value: number) {
    this.rotation = value;
  }
}
