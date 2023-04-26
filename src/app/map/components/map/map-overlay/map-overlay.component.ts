import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResizeHandlerLocation} from '../../../../shared/types/resize-handler-location';
import {StyleExpression} from '../../../../shared/types/style-expression';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss']
})
export class MapOverlayComponent {
  @Input() public isVisible: boolean = false;
  @Input() public title: string = '';
  @Input() public location: ResizeHandlerLocation = 'left';
  @Output() public closeEvent = new EventEmitter<void>();
  public resizeableStyle: StyleExpression = {};

  public onClose() {
    this.resizeableStyle = {};
    this.closeEvent.emit();
  }

  public resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }
}
