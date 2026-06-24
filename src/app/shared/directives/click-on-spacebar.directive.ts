import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[clickOnSpaceBar]',
  standalone: true,
  host: {
    '(keydown.space)': 'onSpaceBar($event)',
  },
})
export class ClickOnSpaceBarDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  public onSpaceBar(event: KeyboardEvent): void {
    event.preventDefault();
    this.elementRef.nativeElement.click();
  }
}
