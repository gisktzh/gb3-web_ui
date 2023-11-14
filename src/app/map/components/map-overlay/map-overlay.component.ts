import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {LoadingState} from '../../../shared/types/loading-state.type';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss'],
})
export class MapOverlayComponent {
  @Input() public showPrintButton: boolean = true;
  @Input() public isPrintButtonEnabled: boolean = false;
  @Input() public printLoadingState: LoadingState;
  @Input() public isVisible: boolean = false;
  @Input() public overlayTitle: string = '';
  @Input() public location: ResizeHandlerLocation = 'left';
  @Output() public readonly closeEvent = new EventEmitter<void>();
  @Output() public readonly printButtonEvent = new EventEmitter<void>();
  public resizeableStyle: StyleExpression = {};

  public onClose() {
    this.resizeableStyle = {};
    this.closeEvent.emit();
  }

  public onPrintButtonClick() {
    this.printButtonEvent.emit();
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }
}
