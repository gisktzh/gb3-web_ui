import {Component, computed, DOCUMENT, effect, inject, signal, Signal, viewChild} from '@angular/core';
import {SearchResultIdentifierDirective} from '../../../directives/search-result-identifier.directive';
import {selectTerm} from '../../../../state/app/reducers/search.reducer';
import {Store} from '@ngrx/store';
import {SearchBarComponent} from '../search-bar/search-bar.component';

@Component({
  selector: 'abstract-search-container',
  imports: [],
  template: '',
  host: {
    '(keydown.arrowdown)': 'handleArrowDown($event)',
    '(keydown.arrowup)': 'handleArrowUp($event)',
    '(keydown.tab)': 'handleTab($event)',
    '(keydown.shift.tab)': 'handleTab($event)',
    '(keydown.enter)': 'handleEnter($event)',
    '(keydown.space)': 'handleEnter($event)',
  },
})
// eslint-disable-next-line rxjs-angular-x/prefer-composition -- This rule fails because of the searchInput focus event effect that actually cleans up after itself. This rule triggers a false positive in this case.
export abstract class BaseSearchContainerComponent {
  protected readonly store: Store = inject(Store);
  private readonly document = inject(DOCUMENT);
  public abstract allSearchResults: Signal<readonly SearchResultIdentifierDirective[]>;
  public readonly searchComponent = viewChild.required(SearchBarComponent);
  private readonly term = this.store.selectSignal(selectTerm);
  private readonly selectedSearchResultIndex = signal(-1);
  public readonly totalResults = computed(() => this.allSearchResults().length);

  constructor() {
    effect(() => {
      // Create a dependency on `term`.
      this.term();
      queueMicrotask(() => {
        this.selectedSearchResultIndex.set(-1);
      });
    });

    effect((onCleanup) => {
      const searchInputInstance = this.searchComponent().searchInput();

      const subscription = searchInputInstance.focusEvent.subscribe(() => {
        queueMicrotask(() => {
          this.selectedSearchResultIndex.set(-1);
        });
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  public handleArrowDown(event: KeyboardEvent) {
    this.handleArrowKey(event, 'down');
  }

  public handleArrowUp(event: KeyboardEvent) {
    this.handleArrowKey(event, 'up');
  }

  public handleTab(event: KeyboardEvent) {
    // If we are tabbing from the search input, we need to set the index to the currently focused element
    if (this.selectedSearchResultIndex() < 0) {
      // We need to wait for the next tick to get the currently focused element instead of the previously focused element
      queueMicrotask(() => {
        this.updateIndexToSelectedElement();
      });
    } else {
      const direction = event.shiftKey ? -1 : 1;
      // Find the next focusable element (first of group) and set focus on it
      for (let i = this.selectedSearchResultIndex() + direction; i >= 0 && i < this.allSearchResults().length; i += direction) {
        const item = this.allSearchResults()[i];
        if (item.isFocusable()) {
          event.preventDefault();
          this.selectedSearchResultIndex.set(i);
          this.setFocusOnSelectedElement();
          return;
        }
      }
      // If there was no focusable element (move back from first group or forward from last group), we reset the index
      this.selectedSearchResultIndex.set(-1);
    }
  }

  public handleEnter(event: KeyboardEvent) {
    if (this.selectedSearchResultIndex() >= 0 && this.totalResults() > 0) {
      event.preventDefault();
      const result = this.allSearchResults()[this.selectedSearchResultIndex()];
      result.host.nativeElement.click();
    }
  }

  private handleArrowKey(event: KeyboardEvent, direction: 'up' | 'down') {
    event.preventDefault();
    this.updateIndexToSelectedElement();
    this.updateIndex(direction);
    this.setFocusOnSelectedElement();
  }

  private updateIndex(direction: 'up' | 'down') {
    switch (direction) {
      case 'up':
        if (this.selectedSearchResultIndex() < 0) {
          this.selectedSearchResultIndex.set(this.totalResults() - 1);
        } else {
          this.selectedSearchResultIndex.set(this.selectedSearchResultIndex() - 1);
        }
        break;
      case 'down':
        if (this.selectedSearchResultIndex() >= this.totalResults() - 1) {
          this.selectedSearchResultIndex.set(-1);
        } else {
          this.selectedSearchResultIndex.set(this.selectedSearchResultIndex() + 1);
        }
        break;
    }
  }

  private setFocusOnSelectedElement() {
    if (this.selectedSearchResultIndex() >= 0 && this.totalResults() > 0) {
      const selectedResult = this.allSearchResults()[this.selectedSearchResultIndex()];
      this.searchComponent().searchInput().setTerm(selectedResult.text(), false);
      selectedResult.host.nativeElement.focus();
    } else {
      this.searchComponent().searchInput().focus();
      this.searchComponent().searchInput().setTerm(this.term(), false);
    }
  }

  // This method syncs the selectedSearchResultIndex with the currently focused element
  // Used in cases where the focus is set outside of this class (i.e. tab key navigation) or when tab is pressed from the search input
  private updateIndexToSelectedElement() {
    const activeElement = this.document.activeElement;
    const focusableElements = this.allSearchResults().filter((item) => item.isFocusable());
    const activeResult = focusableElements.find((item) => item.host.nativeElement === activeElement);
    if (activeResult) {
      this.selectedSearchResultIndex.set(this.allSearchResults().indexOf(activeResult));
    }
  }
}
