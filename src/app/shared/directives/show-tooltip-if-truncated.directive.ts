import {Directive, ElementRef, HostListener, inject} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';

// Checks if text is truncated
// Copied from Stack-Overflow and adapted to specific usecase: https://stackoverflow.com/questions/57269431/show-tooltip-only-when-the-ellipsis-is-active

@Directive({selector: '[matTooltip][showTooltipIfTruncated]'})
export class ShowTooltipIfTruncatedDirective {
  private readonly matTooltip = inject(MatTooltip);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('mouseenter')
  public setTooltipState(): void {
    const element = this.elementRef.nativeElement;
    this.matTooltip.disabled = element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight;
  }
}
