import {Gb3SymbolStyle} from './../../../../../shared/interfaces/internal-drawing-representation.interface';
import {Component, model} from '@angular/core';
import {DrawingSymbolsComponent} from '../../../drawing-symbols/drawing-symbols.component';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {debounce, form, required} from '@angular/forms/signals';

const INPUT_DEBOUNCE_IN_MS = 10;

@Component({
  selector: 'symbol-edit',
  templateUrl: './symbol-edit.component.html',
  styleUrl: './symbol-edit.component.scss',
  imports: [DrawingSymbolsComponent],
})
export class SymbolEditComponent {
  public readonly symbolStyle = model.required<{
    style: Gb3SymbolStyle;
    selectedSymbol: DrawingSymbolDefinition | null;
  }>();

  public symbolStyleForm = form(this.symbolStyle, (fieldPath) => {
    required(fieldPath.selectedSymbol);
    debounce(fieldPath.selectedSymbol, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.symbolSize, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.symbolRotation, INPUT_DEBOUNCE_IN_MS);
  });
}
