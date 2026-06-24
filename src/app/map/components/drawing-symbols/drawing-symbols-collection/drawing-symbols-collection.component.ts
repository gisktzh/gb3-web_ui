import {Component, computed, effect, inject, input, model, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolChoice} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

@Component({
  selector: 'drawing-symbols-collection',
  templateUrl: './drawing-symbols-collection.component.html',
  styleUrls: ['./drawing-symbols-collection.component.scss'],
})
export class DrawingSymbolsCollectionComponent {
  public readonly collectionId = input.required<string>();
  public readonly groupName = input('');
  public readonly value = model<DrawingSymbolDefinition | null>(null);
  public readonly items = signal<DrawingSymbolChoice[]>([]);
  public readonly statefulItems = computed<{symbol: DrawingSymbolChoice; isSelected: boolean}[]>(() => {
    const innerValue = this.value();

    return this.items().map((symbol) => ({
      symbol,
      isSelected: innerValue ? this.drawingSymbolsService.isSameSymbol(symbol.item, innerValue) : false,
    }));
  });
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  constructor() {
    const service = this.drawingSymbolsService;

    effect(async () => {
      this.items.set(await firstValueFrom(service.getCollection(this.collectionId())));
    });
  }
}
