import {Directive, HostListener} from '@angular/core';
import {MatIconAnchor} from '@angular/material/button';

@Directive({
  selector: '[clickOnSpaceBar]',
})
export class ClickOnSpaceBarDirective {
  constructor(private elementRef: MatIconAnchor) {}

  @HostListener('keydown.space', ['$event'])
  public clickOnSpaceBar(): void {
    this.elementRef._elementRef.nativeElement.click();
  }
}
