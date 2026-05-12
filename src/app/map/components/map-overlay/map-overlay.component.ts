import {Component, input, output, signal} from '@angular/core';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SharedModule} from '../../../shared/shared.module';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss'],
  imports: [SharedModule],
})
export class MapOverlayComponent {
  public showPrintButton = input(true);
  public isPrintButtonEnabled = input(false);
  public printLoadingState = input<LoadingState>();
  public isVisible = input(false);
  public overlayTitle = input('');
  public location = input<ResizeHandlerLocation>('left');
  public closeEvent = output();
  public printButtonEvent = output();
  public resizeableStyle = signal<StyleExpression>({});

  public onClose() {
    this.resizeableStyle.set({});
    this.closeEvent.emit();
  }

  public onPrintButtonClick() {
    this.printButtonEvent.emit();
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle.set(newStyle);
  }
}
