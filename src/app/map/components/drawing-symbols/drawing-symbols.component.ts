import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
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
  @Input() public groupName: string = '';
  @Input() public fullHeight: boolean = false;

  private internallSymbol: DrawingSymbolDefinition | undefined = undefined;
  @Input()
  public set symbolValue(value: DrawingSymbolDefinition | undefined) {
    this.internallSymbol = value;
  }
  public get symbolValue() {
    return this.internallSymbol;
  }

  private internalSize: number = SymbolStyleConstants.DEFAULT_SYMBOL_SIZE;
  @Input()
  public set sizeValue(value: number) {
    this.internalSize = value;
  }
  public get sizeValue() {
    return this.internalSize;
  }

  private internalRotation: number = 0;
  @Input()
  public set rotationValue(value: number) {
    this.internalRotation = value;
  }
  public get rotationValue() {
    return this.internalRotation;
  }

  @Output() public readonly symbolChange = new EventEmitter<DrawingSymbolDefinition>();
  @Output() public readonly sizeChange = new EventEmitter<number>();
  @Output() public readonly rotationChange = new EventEmitter<number>();
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  public get collections() {
    return Object.entries(this.drawingSymbolsService.getCollectionInfos()).map(([id, collectionInfo]) => ({
      id,
      ...collectionInfo,
    }));
  }

  public onSymbolChange(value: DrawingSymbolDefinition) {
    this.internallSymbol = value;
    this.symbolChange.emit(value);
  }

  public onSizeChange(value: number) {
    this.internalSize = value;
    this.sizeChange.emit(value);
  }

  public onRotationChange(value: number) {
    this.internalRotation = value;
    this.rotationChange.emit(value);
  }
}
