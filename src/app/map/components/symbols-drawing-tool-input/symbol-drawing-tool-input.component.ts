import {Component, inject, signal} from '@angular/core';
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
  public readonly drawingSymbolDefinition = signal<DrawingSymbolDefinition | null>(null);
  public readonly size = signal(SymbolStyleConstants.DEFAULT_SYMBOL_SIZE);
  public readonly rotation = signal(SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION);

  public close() {
    this.dialogRef.close();
  }
}
