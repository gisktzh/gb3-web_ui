import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResizeEvent, ResizableModule} from 'angular-resizable-element';
import {ResizeHandlerLocation} from '../../types/resize-handler-location.type';
import {StyleExpression} from '../../types/style-expression.type';
import {NgClass} from '@angular/common';

/**
 * The minimum width and height of the overlay window; cannot be resized below that.
 */
const MIN_DIMENSIONS_WIDTH__PX = 300;
const MIN_DIMENSIONS_HEIGHT__PX = 220;

/**
 * Maximum width and height of resize windows in percentage; cannot be resized above that.
 */
const MAX_DIMENSION_PERCENTAGE = 0.85;

@Component({
  selector: 'resize-handler',
  templateUrl: './resize-handler.component.html',
  styleUrls: ['./resize-handler.component.scss'],
  imports: [ResizableModule, NgClass],
})
export class ResizeHandlerComponent {
  @Input() public minWidth = MIN_DIMENSIONS_WIDTH__PX;
  @Input() public minHeight = MIN_DIMENSIONS_HEIGHT__PX;
  @Input() public maxWidth?: number;
  @Input() public maxHeight?: number;
  @Input() public location!: ResizeHandlerLocation;
  @Input() public usePrimaryColor: boolean = false;
  @Output() public readonly resizeEvent = new EventEmitter<StyleExpression>();
  public resizeableStyle: StyleExpression = {};
  public isResizeActive: boolean = false;

  public onResizeStart() {
    this.isResizeActive = true;
  }

  public validate(event: ResizeEvent): boolean {
    const maxResizeWidth = this.maxWidth ?? window.innerWidth * MAX_DIMENSION_PERCENTAGE;
    const maxResizeHeight = this.maxHeight ?? window.innerHeight * MAX_DIMENSION_PERCENTAGE;
    switch (this.location) {
      case 'left':
      case 'right':
        return !!(
          event.rectangle.width &&
          event.rectangle.height &&
          event.rectangle.width > this.minWidth &&
          event.rectangle.width < maxResizeWidth
        );
      case 'top':
        return !!(
          event.rectangle.width &&
          event.rectangle.height &&
          event.rectangle.height > this.minHeight &&
          event.rectangle.height < maxResizeHeight
        );
    }
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
