import {AfterViewInit, Component, computed, inject, input, OnDestroy, output, signal, TemplateRef, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {ResizeHandlerComponent} from 'src/app/shared/components/resize-handler/resize-handler.component';
import {KeyValuePipe, NgTemplateOutlet} from '@angular/common';
import {HyphenatePipe} from 'src/app/map/pipes/hyphenate.pipe';
import {AbstractTableCell, InfoTableCellComponent, TableCell} from './info-table-cell.component';

/**
 * A TableHeader is a AbstractTableCell with a displayValue that is string only.
 */
export interface TableHeader extends Omit<AbstractTableCell, 'cellType'> {
  displayValue: string;
  hasGeometry: boolean;
}

/**
 * A row consists of a key which represents the attribute value ("header" in the transposed table) and a set of AbstractTableCell
 * objects.
 */
export type TableRows = Map<string, TableCell[]>;

export type TableData = {
  tableHeaders: TableHeader[];
  tableRows: TableRows;
};

const DEFAULT_TABLE_HEADER_WIDTH = 130;
const MIN_TABLE_HEADER_WIDTH = 80;
const TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO = 0.8;

@Component({
  selector: 'resizable-info-table',
  templateUrl: './resizable-info-table.component.html',
  styleUrls: ['./resizable-info-table.component.scss'],
  imports: [ResizeHandlerComponent, KeyValuePipe, HyphenatePipe, NgTemplateOutlet, InfoTableCellComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ResizableInfoTableComponent implements OnDestroy, AfterViewInit {
  public readonly store = inject(Store);

  public readonly tableHeaderTemplate = input<TemplateRef<unknown>>();
  public readonly tableCellTemplate = input<TemplateRef<unknown>>();
  public readonly resizeContainer = input<HTMLElement>();
  public readonly tableData = input.required<TableData>();
  public readonly tableLabel = input.required<string>();
  public readonly resizeHandlerResizeStart = output();
  public readonly resizeHandlerResizeEnd = output();

  public readonly containerWidth = signal(0);
  public readonly containerScrollWidth = signal(0);
  public readonly minTableHeaderWidth: number = MIN_TABLE_HEADER_WIDTH;
  public readonly tableHeaderWidth = signal(`${DEFAULT_TABLE_HEADER_WIDTH}px`);
  public readonly maxTableHeaderWidth = computed(() => this.containerWidth() * TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO);
  public readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);

  public readonly tableRows = computed(() => this.tableData().tableRows);
  public readonly tableHeaders = computed(() => this.tableData().tableHeaders);
  public resizeObserver!: ResizeObserver;

  public readonly calculatedScrollbarHeight = computed(() => {
    if (this.containerWidth() < this.containerScrollWidth()) {
      return this.scrollbarWidth();
    }

    return 0;
  });

  /**
   * Fixed compareFn for KeyValuePipe that always returns 0, essentially preserving the key order of the object. This
   * is necessary because the KeyValuePipe orders the keys ascending: https://angular.io/api/common/KeyValuePipe#description
   */
  public preserveKeyValueOrder(): number {
    return 0;
  }

  public resize(style: StyleExpression) {
    this.tableHeaderWidth.set(style['width'] ?? `${DEFAULT_TABLE_HEADER_WIDTH}px`);
  }

  public ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  public ngAfterViewInit() {
    this.initResizeObserver();
  }

  /**
   * Initializes the ResizeObserver to listen for any changes to the content elements. This will fire when the outer container (which is
   * resizable as well) is resized and we then need to calculate the new maximum width (since that is 80% of the full width). In cases where
   * the outer container is resized to a smaller size, we reset the current width to the default width to ensure the elements are always
   * visible and do not overflow (e.g. if you have a very large container and very broad table headers, resizing it to small will make the
   * table unusable since the drag hanler is out of reach).
   */
  public initResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    const container = this.resizeContainer();
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  public onResize() {
    // Use a timeout here to let the browser recalculate thigs first.
    setTimeout(() => {
      const container = this.resizeContainer();

      if (!container) {
        return;
      }

      const effectiveWidth = container.clientWidth;
      let scrollWidth = container.scrollWidth;

      this.containerWidth.set(effectiveWidth);
      this.containerScrollWidth.set(scrollWidth);

      if (this.maxTableHeaderWidth() > effectiveWidth * TABLE_HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO) {
        this.resize({width: `${DEFAULT_TABLE_HEADER_WIDTH}px`});

        // Resizing automatically means different scrollWidth, using a timeout here too to let the browser catch up.
        setTimeout(() => {
          scrollWidth = container.scrollWidth;
          this.containerScrollWidth.set(scrollWidth);
        });
      }
    });
  }

  public onResizeHandlerResizeEnd() {
    this.onResize();
    this.resizeHandlerResizeEnd.emit();
  }

  public onResizeHandlerResizeStart() {
    this.resizeHandlerResizeStart.emit();
  }

  public getTableHeaderContext(tableHeader: TableHeader): {$implicit: TableHeader} {
    return {$implicit: tableHeader};
  }

  public getTableCellContext(tableCell: TableCell): {$implicit: TableCell} {
    return {$implicit: tableCell};
  }
}
