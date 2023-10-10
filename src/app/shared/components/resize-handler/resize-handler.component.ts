import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResizeEvent} from 'angular-resizable-element';
import {ResizeHandlerLocation} from '../../types/resize-handler-location.type';
import {StyleExpression} from '../../types/style-expression.type';

/**
 * The minimum width and height of the overlay window; cannot be resized below that.
 */
const MIN_DIMENSIONS_WIDTH__PX = 300;
const MIN_DIMENSIONS_HEIGHT__PX = 220;

/**
 * Maximum width and height of resize windows in percentage; cannot be resized above that.
 */
const MAX_DIMENSION_PERCENTAGE = 0.9;

@Component({
  selector: 'resize-handler',
  templateUrl: './resize-handler.component.html',
  styleUrls: ['./resize-handler.component.scss'],
})
export class ResizeHandlerComponent {
  @Input() public location!: ResizeHandlerLocation;
  @Output() public readonly resizeEvent = new EventEmitter<StyleExpression>();
  public resizeableStyle: StyleExpression = {};
  public isResizeActive: boolean = false;

  public onResizeStart() {
    this.isResizeActive = true;
  }

  public validate(event: ResizeEvent): boolean {
    const maxResizeWidth = window.innerWidth * MAX_DIMENSION_PERCENTAGE;
    return !!(
      event.rectangle.width &&
      event.rectangle.height &&
      event.rectangle.width > MIN_DIMENSIONS_WIDTH__PX &&
      event.rectangle.width < maxResizeWidth
    );
  }

  public validateTop(event: ResizeEvent): boolean {
    const maxResizeHeight = window.innerHeight * MAX_DIMENSION_PERCENTAGE;
    return !!(
      event.rectangle.width &&
      event.rectangle.height &&
      event.rectangle.height > MIN_DIMENSIONS_HEIGHT__PX &&
      event.rectangle.height < maxResizeHeight
    );
  }

  public onResizeEnd(event: ResizeEvent): void {
    switch (this.location) {
      case 'left':
      case 'right':
        this.resizeableStyle = {
          width: `${event.rectangle.width}px`,
        };
        break;
      case 'top':
        this.resizeableStyle = {
          position: 'fixed',
          height: `${event.rectangle.height}px`,
        };
        break;
    }
    this.resizeEvent.emit(this.resizeableStyle);
    this.isResizeActive = false;
  }
}
