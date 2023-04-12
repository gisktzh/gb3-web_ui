import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {ResizeHandlerLocation} from '../../types/resize-handler-location';
import {ResizeEvent} from 'angular-resizable-element';
import {StyleExpression} from '../../types/style-expression';
import {WINDOW} from '../../../app.module';

/**
 * The minimum width of the overlay window; cannot be resized below that.
 */
const MIN_DIMENSIONS_PX = 150;

/**
 * Maximum width of resize windows in percentage; cannot be resized above that.
 */
const MAX_DIMENSION_PERCENTAGE = 0.9;

@Component({
  selector: 'resize-handler',
  templateUrl: './resize-handler.component.html',
  styleUrls: ['./resize-handler.component.scss']
})
export class ResizeHandlerComponent {
  @Input() public location!: ResizeHandlerLocation;
  @Output() public resizeEvent = new EventEmitter<StyleExpression>();
  public resizeableStyle: StyleExpression = {};
  public isResizeActive: boolean = false;

  constructor(@Inject(WINDOW) private readonly window: Window) {}

  public onResizeStart() {
    this.isResizeActive = true;
  }

  public validate(event: ResizeEvent): boolean {
    const maxResizeWidth = this.window.innerWidth * MAX_DIMENSION_PERCENTAGE;
    return !!(
      event.rectangle.width &&
      event.rectangle.height &&
      event.rectangle.width > MIN_DIMENSIONS_PX &&
      event.rectangle.width < maxResizeWidth
    );
  }

  public onResizeEnd(event: ResizeEvent): void {
    this.resizeableStyle = {
      width: `${event.rectangle.width}px`
    };

    this.resizeEvent.emit(this.resizeableStyle);
    this.isResizeActive = false;
  }
}
