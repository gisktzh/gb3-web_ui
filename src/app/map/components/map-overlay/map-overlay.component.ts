import {Component, computed, input, output, signal, ChangeDetectionStrategy} from '@angular/core';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SharedModule} from '../../../shared/shared.module';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SharedModule],
})
export class MapOverlayComponent {
  public readonly showPrintButton = input(true);
  public readonly isPrintButtonEnabled = input(false);
  public readonly printLoadingState = input<LoadingState>();
  public readonly isVisible = input(false);
  public readonly overlayTitle = input('');
  public readonly location = input<ResizeHandlerLocation>('left');
  /**
   * Width in pixels. If given, it takes precedence over the internally managed width; used for overlays whose width is kept in the global
   * state (i.e. the ones shown within the map side bar) instead of within this component.
   */
  public readonly width = input<number | undefined>(undefined);
  public readonly closeEvent = output();
  public readonly printButtonEvent = output();
  /** Emits the new width in pixels whenever the overlay has been resized horizontally. */
  public readonly resizeEvent = output<number>();
  public readonly resizeableStyle = signal<StyleExpression>({});

  public readonly overlayStyle = computed<StyleExpression>(() => {
    const width = this.width();
    return width === undefined ? this.resizeableStyle() : {width: `${width}px`};
  });

  public onClose() {
    this.resizeableStyle.set({});
    this.closeEvent.emit();
  }

  public onPrintButtonClick() {
    this.printButtonEvent.emit();
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle.set(newStyle);
    const width = newStyle['width'];
    if (typeof width === 'string') {
      this.resizeEvent.emit(parseFloat(width));
    }
  }
}
