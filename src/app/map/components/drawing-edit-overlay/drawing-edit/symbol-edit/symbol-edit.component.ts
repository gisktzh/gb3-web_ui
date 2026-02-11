import {
  Gb3SymbolStyle,
  DrawingSymbolStyleConfiguration,
} from './../../../../../shared/interfaces/internal-drawing-representation.interface';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DrawingSymbolsComponent} from '../../../drawing-symbols/drawing-symbols.component';
import {debounceTime, Subject, Subscription, tap} from 'rxjs';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

const INPUT_DEBOUNCE_IN_MS = 10;

@Component({
  selector: 'symbol-edit',
  templateUrl: './symbol-edit.component.html',
  styleUrl: './symbol-edit.component.scss',
  imports: [DrawingSymbolsComponent],
})
export class SymbolEditComponent implements OnInit, OnDestroy {
  @Input() public style!: Gb3SymbolStyle;
  @Input() public selectedSymbol: DrawingSymbolDefinition | undefined = undefined;

  @Output() public readonly updateStyleEvent = new EventEmitter<{
    style: Gb3SymbolStyle;
    drawingSymbolDefinition: DrawingSymbolDefinition;
  }>();

  private readonly subscriptions = new Subscription();
  private readonly debouncer = new Subject<{
    field: keyof DrawingSymbolStyleConfiguration;
    value: number;
  }>();

  public onSymbolChange(value: DrawingSymbolDefinition) {
    this.selectedSymbol = value;

    this.updateStyleEvent.emit({
      drawingSymbolDefinition: value,
      style: this.style,
    });
  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.debouncer
        .pipe(
          debounceTime(INPUT_DEBOUNCE_IN_MS),
          tap(({field, value}) => this.updateValue(field, value)),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public updateValue(field: keyof DrawingSymbolStyleConfiguration, value: number | string) {
    this.style = {
      ...this.style,
      [field]: value,
    };

    if (this.selectedSymbol) {
      this.updateStyleEvent.emit({style: this.style, drawingSymbolDefinition: this.selectedSymbol});
    }
  }

  public updateValueWithDelay(field: keyof DrawingSymbolStyleConfiguration, value: number) {
    this.debouncer.next({field, value});
  }
}
