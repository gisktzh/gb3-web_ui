import {Gb3SymbolStyle} from './../../../../../shared/interfaces/internal-drawing-representation.interface';
import {Component, effect, linkedSignal, model, ChangeDetectionStrategy} from '@angular/core';
import {DrawingSymbolsComponent} from '../../../drawing-symbols/drawing-symbols.component';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {debounce, form, required} from '@angular/forms/signals';

const INPUT_DEBOUNCE_IN_MS = 10;

const DEFAULT_STYLE = {
  symbolSize: 30,
  symbolRotation: 0,
};

@Component({
  selector: 'symbol-edit',
  templateUrl: './symbol-edit.component.html',
  styleUrl: './symbol-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DrawingSymbolsComponent],
})
export class SymbolEditComponent {
  public readonly symbolStyle = model.required<{
    style: Gb3SymbolStyle;
    selectedSymbol: DrawingSymbolDefinition | null;
  }>();

  public readonly symbolStyleFormModel = linkedSignal({
    source: this.symbolStyle,
    computation: (value) => ({
      selectedSymbol: value.selectedSymbol,
      style: {
        ...DEFAULT_STYLE,
        ...value.style,
      },
    }),
  });

  public symbolStyleForm = form(this.symbolStyleFormModel, (fieldPath) => {
    required(fieldPath.selectedSymbol);
    debounce(fieldPath.selectedSymbol, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.symbolSize, INPUT_DEBOUNCE_IN_MS);
    debounce(fieldPath.style.symbolRotation, INPUT_DEBOUNCE_IN_MS);
  });

  constructor() {
    effect(() => {
      const styleFormModel = this.symbolStyleFormModel();
      const style = this.symbolStyle();

      if (JSON.stringify(styleFormModel) !== JSON.stringify(style)) {
        this.symbolStyle.set({...this.symbolStyleFormModel()});
      }
    });
  }
}
