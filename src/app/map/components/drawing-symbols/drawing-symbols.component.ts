import {Component, inject, input, model} from '@angular/core';
import {ExpandableListItemComponent} from 'src/app/shared/components/expandable-list-item/expandable-list-item.component';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection/drawing-symbols-collection.component';
import {SliderEditComponent} from '../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {MatAccordion} from '@angular/material/expansion';
import {SymbolStyleConstants} from 'src/app/shared/constants/symbol-style.constants';

@Component({
  selector: 'drawing-symbols',
  templateUrl: './drawing-symbols.component.html',
  styleUrls: ['./drawing-symbols.component.scss'],
  imports: [DrawingSymbolsCollectionComponent, ExpandableListItemComponent, SliderEditComponent, MatAccordion],
})
export class DrawingSymbolsComponent {
  public readonly groupName = input('');
  public readonly fullHeight = input(false);
  public readonly symbol = model<DrawingSymbolDefinition | null>(null);
  public readonly size = model(SymbolStyleConstants.DEFAULT_SYMBOL_SIZE);
  public readonly rotation = model(0);

  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  public get collections() {
    return Object.entries(this.drawingSymbolsService.getCollectionInfos()).map(([id, collectionInfo]) => ({
      id,
      ...collectionInfo,
    }));
  }
}
