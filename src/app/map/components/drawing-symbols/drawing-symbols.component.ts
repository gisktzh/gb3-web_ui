import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ExpandableListItemComponent} from 'src/app/shared/components/expandable-list-item/expandable-list-item.component';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection/drawing-symbols-collection.component';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {SliderEditComponent} from '../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';

const COLLECTIONS = [
  {
    label: 'Tiere',
    id: '1fbb242c54e4415d9b8e8a343ca7a9d0',
  },
  {
    label: 'Pfeile',
    id: 'eef578633a3e41b985d0c980275c6d74',
  },
  {
    label: 'Gebäude',
    id: 'fe12ab0e0c834ca2adff4e10f68e1327',
  },
  {
    label: 'Öffentliche Hand',
    id: '6eeef46c653b40c9bda04f9bed913b70',
  },
  {
    label: 'Landschaften 1',
    id: 'e9cb6bb3273342b69628e0da4be1b60c',
  },
  {
    label: 'Landschaften 2',
    id: '8560ce55ee7547a0b6b1d59df76d3f6b',
  },
  {
    label: 'Nationalpark/Naturpark',
    id: '36359a4a8f3143b6bf44d5688e007900',
  },
  {
    label: 'Orte von Interesse',
    id: '11e7b433c72a4cef90c8a428de131147',
  },
  {
    label: 'Öffentliche Sicherheit',
    id: 'b117b6e14d7b429a9ea8c58a5cb6abad',
  },
  {
    label: 'Bäume',
    id: 'e08037675f354ea1bab42359b9a0c04b',
  },
  {
    label: 'UN OCHA',
    id: '806df898e9c04516a704a9f93e2a0a5e',
  },
];

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
  @Input() public symbolValue: WebStyleSymbol | undefined = undefined;
  @Input() public sizeValue: number = 10;
  @Input() public rotationValue: number = 0;
  @Input() public fullHeight: boolean = false;
  @Output() public symbolChange = new EventEmitter<WebStyleSymbol>();
  @Output() public sizeChange = new EventEmitter<number>();
  @Output() public rotationChange = new EventEmitter<number>();

  public collections = COLLECTIONS;

  public onSymbolChange(value: WebStyleSymbol) {
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
