import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject} from '@angular/core';

@Directive({
  selector: '[searchResultIdentifier]',
  standalone: true,
})
export class SearchResultIdentifierDirective {
  public readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() public isMapResult: boolean = false;
  @Input({required: true}) public text!: string;
  @Input() public isFocusable: boolean = false;
  @Output() public readonly addResultFromArrowNavigation = new EventEmitter<void>();
  @Output() public readonly removeResultFromArrowNavigation = new EventEmitter<void>();

  @HostListener('focus')
  public addTemporaryMap() {
    if (this.isMapResult) {
      this.addResultFromArrowNavigation.emit();
    }
  }

  @HostListener('blur')
  public removeTemporaryMap() {
    if (this.isMapResult) {
      this.removeResultFromArrowNavigation.emit();
    }
  }
}
