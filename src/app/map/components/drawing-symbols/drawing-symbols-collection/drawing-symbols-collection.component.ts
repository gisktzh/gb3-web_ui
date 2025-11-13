import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {EsriDrawingSymbolsService} from 'src/app/map/services/esri-services/esri-drawing-symbols.service';
import {DrawingSymbolsCollectionItem} from '../../../services/esri-services/types/drawing-symbols-collection.type';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import {Subscription} from 'rxjs';

@Component({
  selector: 'drawing-symbols-collection',
  templateUrl: './drawing-symbols-collection.component.html',
  styleUrls: ['./drawing-symbols-collection.component.scss'],
})
export class DrawingSymbolsCollectionComponent implements OnInit, OnDestroy {
  @Input() public collectionId: string = '';
  @Input() public groupName: string = '';
  @Input() public value: WebStyleSymbol | undefined = undefined;
  @Output() public valueChange = new EventEmitter<WebStyleSymbol>();
  public items: DrawingSymbolsCollectionItem[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  private readonly estriDrawingSymbolsService = inject(EsriDrawingSymbolsService);

  ngOnInit() {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.estriDrawingSymbolsService.getCollection(this.collectionId).subscribe((response) => {
        this.items = response;
      }),
    );
  }

  public onValueChange(value: WebStyleSymbol) {
    this.value = value;
    this.valueChange.emit(value);
  }

  public isSelected(value: WebStyleSymbol) {
    return this.value?.name === value.name && this.value?.styleUrl === value.styleUrl;
  }
}
