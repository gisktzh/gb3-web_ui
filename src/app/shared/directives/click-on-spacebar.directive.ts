import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[clickOnSpaceBar]',
})
export class ClickOnSpaceBarDirective {
  constructor(private elementRef: ElementRef) {}

  @HostListener('keydown.space', ['$event'])
  public clickOnSpaceBar(event: KeyboardEvent): void {
    event.preventDefault();
    this.elementRef.nativeElement.click();
  }
}
