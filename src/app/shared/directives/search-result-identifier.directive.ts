import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[searchResultIdentifier]',
  standalone: true,
})
export class SearchResultIdentifierDirective {
  @Input() public isMapResult: boolean = false;
  @Input() public text: string = '';
  @Output() public readonly addResultFromArrowNavigation = new EventEmitter<void>();
  @Output() public readonly removeResultFromArrowNavigation = new EventEmitter<void>();
  constructor(public readonly host: ElementRef<HTMLElement>) {}

  public dispatchEventIfMapResult() {
    if (this.isMapResult) {
      this.addResultFromArrowNavigation.emit();
    }
  }

  public removeSearchResult() {
    if (this.isMapResult) {
      this.removeResultFromArrowNavigation.emit();
    }
  }
}
