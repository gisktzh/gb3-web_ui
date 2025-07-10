import {Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[clickOnSpaceBar]',
  standalone: true,
})
export class ClickOnSpaceBarDirective {
  private elementRef = inject(ElementRef);

  @HostListener('keydown.space', ['$event'])
  public clickOnSpaceBar(event: KeyboardEvent): void {
    event.preventDefault();
    this.elementRef.nativeElement.click();
  }
}
