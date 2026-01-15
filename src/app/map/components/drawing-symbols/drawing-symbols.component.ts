import {Component, EventEmitter, forwardRef, inject, Input, Output} from '@angular/core';
import {ExpandableListItemComponent} from 'src/app/shared/components/expandable-list-item/expandable-list-item.component';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection/drawing-symbols-collection.component';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {SliderEditComponent} from '../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';

@Component({
  selector: 'drawing-symbols',
  templateUrl: './drawing-symbols.component.html',
  styleUrls: ['./drawing-symbols.component.scss'],
  imports: [DrawingSymbolsCollectionComponent, ExpandableListItemComponent, SliderEditComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DrawingSymbolsComponent),
      multi: true,
    },
  ],
})
export class DrawingSymbolsComponent {
  @Input() public groupName: string = '';
  @Input() public symbolValue: DrawingSymbolDefinition | undefined = undefined;
  @Input() public sizeValue: number = 10;
  @Input() public rotationValue: number = 0;
  @Input() public fullHeight: boolean = false;
  @Output() public symbolChange = new EventEmitter<DrawingSymbolDefinition>();
  @Output() public sizeChange = new EventEmitter<number>();
  @Output() public rotationChange = new EventEmitter<number>();
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  public get collections() {
    return this.drawingSymbolsService.getCollectionInfos();
  }

  public onSymbolChange(value: DrawingSymbolDefinition) {
    this.symbolValue = value;
    this.symbolChange.emit(value);
  }

  public onSizeChange(value: number) {
    this.sizeValue = value;
    this.sizeChange.emit(this.sizeValue);
  }

  public onRotationChange(value: number) {
    this.rotationValue = value;
    this.rotationChange.emit(this.rotationValue);
  }
}
