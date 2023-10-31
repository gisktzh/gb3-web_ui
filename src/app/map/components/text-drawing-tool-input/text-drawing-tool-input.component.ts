import {Component, OnInit} from '@angular/core';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';

const TEXT_DRAWING_CONSTRAINTS: ValidatorFn[] = [Validators.minLength(1), Validators.required, Validators.pattern(/\S/)];

@Component({
  selector: 'text-drawing-tool-input',
  templateUrl: './text-drawing-tool-input.component.html',
  styleUrls: ['./text-drawing-tool-input.component.scss'],
})
export class TextDrawingToolInputComponent implements OnInit {
  public textFormControl!: FormControl<string | null>;

  constructor() {}

  public ngOnInit() {
    this.textFormControl = new FormControl('', TEXT_DRAWING_CONSTRAINTS);
  }
}
