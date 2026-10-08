import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Store} from '@ngrx/store';
import {ResizeHandlerComponent} from 'src/app/shared/components/resize-handler/resize-handler.component';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {HyphenatePipe} from 'src/app/map/pipes/hyphenate.pipe';
import {InfoTableCellComponent} from './info-table-cell.component';
import {TableCell, TableData, TableHeader} from './info-table.types';

const DEFAULT_ROW_HEADER_WIDTH = 130;
const MIN_ROW_HEADER_WIDTH = 80;
const ROW_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO = 0.8;

@Component({
  selector: 'resizable-info-table',
  templateUrl: './resizable-info-table.component.html',
  styleUrls: ['./resizable-info-table.component.scss'],
  imports: [ResizeHandlerComponent, HyphenatePipe, NgTemplateOutlet, InfoTableCellComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ResizableInfoTableComponent implements OnDestroy, AfterViewInit {
  private readonly store = inject(Store);
  private readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  public readonly tableHeaderTemplate = input<TemplateRef<unknown>>();
  public readonly tableCellTemplate = input<TemplateRef<unknown>>();
  public readonly tableData = input.required<TableData>();
  public readonly tableLabel = input.required<string>();
  public readonly resizeStart = output();
  public readonly resizeEnd = output();

  public readonly containerWidth = signal(0);
  public readonly containerScrollWidth = signal(0);
  public readonly minRowHeaderWidth = MIN_ROW_HEADER_WIDTH;
  public readonly rowHeaderWidth = signal(`${DEFAULT_ROW_HEADER_WIDTH}px`);
  public readonly maxRowHeaderWidth = computed(() => {
    const containerWidth = this.containerWidth();
    return containerWidth > 0 ? Math.max(MIN_ROW_HEADER_WIDTH + 1, containerWidth * ROW_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO) : undefined;
  });
  public readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);

  public readonly rows = computed(() => this.tableData().rows);
  public readonly headers = computed(() => this.tableData().headers);
  private resizeObserver?: ResizeObserver;

  public readonly calculatedScrollbarHeight = computed(() => {
    return this.containerWidth() < this.containerScrollWidth() ? this.scrollbarWidth() : 0;
  });

  public resize(style: StyleExpression) {
    this.rowHeaderWidth.set(style['width'] ?? `${DEFAULT_ROW_HEADER_WIDTH}px`);
  }

  public ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  public ngAfterViewInit() {
    const container = this.scrollContainer().nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.updateContainerDimensions());
    this.resizeObserver.observe(container);
    this.updateContainerDimensions();
  }

  public updateContainerDimensions() {
    // Wait until the browser has recalculated the table's scroll width.
    setTimeout(() => {
      const container = this.scrollContainer().nativeElement;
      this.containerWidth.set(container.clientWidth);
      this.containerScrollWidth.set(container.scrollWidth);
    });
  }

  public onResizeEnd() {
    this.updateContainerDimensions();
    this.resizeEnd.emit();
  }

  public getTableHeaderContext(tableHeader: TableHeader): {$implicit: TableHeader} {
    return {$implicit: tableHeader};
  }

  public getTableCellContext(tableCell: TableCell): {$implicit: TableCell} {
    return {$implicit: tableCell};
  }
}
