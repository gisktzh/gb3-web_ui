import {Directive, ElementRef, inject, input, output} from '@angular/core';

@Directive({
  selector: '[searchResultIdentifier]',
  standalone: true,
  host: {
    '(focus)': 'addTemporaryMap()',
    '(blur)': 'removeTemporaryMap()',
  },
})
export class SearchResultIdentifierDirective {
  public readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  public readonly isMapResult = input(false);
  public readonly isFocusable = input(false);
  public readonly text = input.required<string>();
  public readonly addResultFromArrowNavigation = output();
  public readonly removeResultFromArrowNavigation = output();

  public addTemporaryMap() {
    if (this.isMapResult()) {
      this.addResultFromArrowNavigation.emit();
    }
  }

  public removeTemporaryMap() {
    if (this.isMapResult()) {
      this.removeResultFromArrowNavigation.emit();
    }
  }
}
