import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialogRef, MatDialogClose} from '@angular/material/dialog';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {form, maxLength, required, FormField, minLength, pattern} from '@angular/forms/signals';

@Component({
  selector: 'text-drawing-tool-input',
  templateUrl: './text-drawing-tool-input.component.html',
  styleUrls: ['./text-drawing-tool-input.component.scss'],
  imports: [ApiDialogWrapperComponent, MatFormField, MatLabel, MatInput, FormsModule, MatError, MatButton, MatDialogClose, FormField],
})
export class TextDrawingToolInputComponent {
  private readonly dialogRef = inject<MatDialogRef<TextDrawingToolInputComponent>>(MatDialogRef);

  public readonly maxLength: number = MapConstants.TEXT_DRAWING_MAX_LENGTH;
  public readonly textModel = signal<{text: string}>({text: ''});
  public textForm = form(this.textModel, (fieldPath) => {
    required(fieldPath.text);
    minLength(fieldPath.text, 1);
    maxLength(fieldPath.text, this.maxLength);
    pattern(fieldPath.text, /\S/);
  });

  public close() {
    this.dialogRef.close();
  }
}
