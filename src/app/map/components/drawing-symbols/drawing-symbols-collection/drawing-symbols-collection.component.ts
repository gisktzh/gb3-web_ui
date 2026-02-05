import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolChoice} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

@Component({
  selector: 'drawing-symbols-collection',
  templateUrl: './drawing-symbols-collection.component.html',
  styleUrls: ['./drawing-symbols-collection.component.scss'],
})
export class DrawingSymbolsCollectionComponent implements OnInit, OnDestroy {
  @Input() public collectionId!: string;
  @Input() public groupName: string = '';
  @Input() public value: DrawingSymbolDefinition | undefined = undefined;
  @Output() public readonly valueChange = new EventEmitter<DrawingSymbolDefinition>();
  public items: DrawingSymbolChoice[] = [];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  ngOnInit() {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.drawingSymbolsService.getCollection(this.collectionId).subscribe((response) => {
        this.items = response;
      }),
    );
  }

  public onValueChange(value: DrawingSymbolDefinition) {
    this.value = value;
    this.valueChange.emit(value);
  }

  public isSelected(value: DrawingSymbolDefinition) {
    if (!this.value) {
      return false;
    }

    return this.drawingSymbolsService.isSameSymbol(value, this.value);
  }
}
