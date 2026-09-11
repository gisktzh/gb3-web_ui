import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import {Store} from '@ngrx/store';
import {ResizeHandlerComponent} from '../../../../shared/components/resize-handler/resize-handler.component';
import {StyleExpression} from '../../../../shared/types/style-expression.type';
import {selectScrollbarWidth} from '../../../../state/app/reducers/app-layout.reducer';

const DEFAULT_HEADER_WIDTH = 130;
const MIN_HEADER_WIDTH = 80;
const HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO = 0.8;

/**
 * The table used by the query result overlays. It owns everything that is independent of the queried data: the horizontal scroll
 * container, the resizable width of the sticky first column, the space the horizontal scrollbar takes away from the resize handle and
 * the look of the rows.
 *
 * Consumers project plain table rows and keep full control over their own cells:
 *
 * ```html
 * <overlay-table ariaDescription="Informationen zu ...">
 *   <tr><th scope="col"></th><th scope="col">Resultat 1</th></tr>
 *   <tr><th scope="row">Fläche</th><td>544</td></tr>
 * </overlay-table>
 * ```
 *
 * The first `th` of a row becomes the sticky label column, unless it spans several columns. Consumers only add classes of their own,
 * for their own concerns, and can override anything here because their styles are scoped and therefore more specific.
 */
@Component({
  selector: 'overlay-table',
  templateUrl: './overlay-table.component.html',
  styleUrls: ['./overlay-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  // Turned off so that this component can style the rows projected into it; the stylesheet explains how it stays contained.
  encapsulation: ViewEncapsulation.None,
  imports: [ResizeHandlerComponent],
})
export class OverlayTableComponent implements AfterViewInit, OnDestroy {
  private readonly store = inject(Store);

  public readonly ariaDescription = input.required<string>();
  /** Tables whose first column carries no long labels do not need the handle and hide it. */
  public readonly isFirstColumnResizable = input(true);
  /** Emitted while the user drags the handle, so that consumers can suppress hover effects for that time. */
  public readonly isResizing = output<boolean>();

  public readonly minHeaderWidth = MIN_HEADER_WIDTH;
  public readonly headerWidth = signal(`${DEFAULT_HEADER_WIDTH}px`);
  public readonly containerWidth = signal(0);
  public readonly containerScrollWidth = signal(0);
  public readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);
  public readonly container = viewChild.required<ElementRef>('container');

  public readonly maxHeaderWidth = computed(() => this.containerWidth() * HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO);

  public readonly calculatedScrollbarHeight = computed(() => {
    if (this.containerWidth() < this.containerScrollWidth()) {
      return this.scrollbarWidth();
    }

    return 0;
  });

  private resizeObserver!: ResizeObserver;

  public ngAfterViewInit() {
    this.initResizeObserver();
  }

  public ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  public resize(style: StyleExpression) {
    this.headerWidth.set(style['width'] ?? `${DEFAULT_HEADER_WIDTH}px`);
  }

  public onResizeEnd() {
    this.isResizing.emit(false);
    this.onResize();
  }

  /**
   * Recalculates the dimensions the resize handle depends on. This fires when the outer container (which is resizable as well) is
   * resized and we then need to calculate the new maximum width (since that is 80% of the full width). In cases where the outer
   * container is resized to a smaller size, we reset the current width to the default width to ensure the elements are always visible
   * and do not overflow (e.g. if you have a very large container and very broad table headers, resizing it to small will make the table
   * unusable since the drag handler is out of reach).
   */
  public onResize() {
    // Use a timeout here to let the browser recalculate things first.
    setTimeout(() => {
      const container = this.container().nativeElement;
      const effectiveWidth = container.clientWidth;
      let scrollWidth = container.scrollWidth;

      this.containerWidth.set(effectiveWidth);
      this.containerScrollWidth.set(scrollWidth);

      if (this.maxHeaderWidth() > effectiveWidth * HEADER_WIDTH_TO_CONTAINER_WIDTH_RATIO) {
        this.resize({width: `${DEFAULT_HEADER_WIDTH}px`});

        // Resizing automatically means different scrollWidth, using a timeout here too to let the browser catch up.
        setTimeout(() => {
          scrollWidth = container.scrollWidth;
          this.containerScrollWidth.set(scrollWidth);
        });
      }
    });
  }

  private initResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container().nativeElement);
  }
}
