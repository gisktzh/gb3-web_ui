import {Component, OnInit, inject} from '@angular/core';
import {FormControl, ValidatorFn, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogRef, MatDialogClose} from '@angular/material/dialog';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

const TEXT_DRAWING_CONSTRAINTS: ValidatorFn[] = [
  Validators.minLength(1),
  Validators.maxLength(MapConstants.TEXT_DRAWING_MAX_LENGTH),
  Validators.required,
  Validators.pattern(/\S/),
];

@Component({
  selector: 'text-drawing-tool-input',
  templateUrl: './text-drawing-tool-input.component.html',
  styleUrls: ['./text-drawing-tool-input.component.scss'],
  imports: [
    ApiDialogWrapperComponent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatButton,
    MatDialogClose,
  ],
})
export class TextDrawingToolInputComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<TextDrawingToolInputComponent>>(MatDialogRef);

  public textFormControl!: FormControl<string | null>;
  public readonly maxLength: number = MapConstants.TEXT_DRAWING_MAX_LENGTH;

  public ngOnInit() {
    this.textFormControl = new FormControl('', TEXT_DRAWING_CONSTRAINTS);
  }

  public close() {
    this.dialogRef.close();
  }
}
