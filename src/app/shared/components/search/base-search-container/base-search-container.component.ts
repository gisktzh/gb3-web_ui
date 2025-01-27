import {AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchResultIdentifierDirective} from '../../../directives/search-result-identifier.directive';
import {SearchComponent} from '../search.component';
import {selectTerm} from '../../../../state/app/reducers/search.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';

@Component({
  selector: 'abstract-search-container',
  imports: [],
  template: '',
})
export class BaseSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  public allSearchResults: SearchResultIdentifierDirective[] = [];
  @ViewChild(SearchComponent) public readonly searchComponent!: SearchComponent;
  private term: string = '';
  private selectedSearchResultIndex: number = -1;
  protected readonly term$ = this.store.select(selectTerm);
  protected readonly subscriptions: Subscription = new Subscription();

  constructor(
    protected readonly store: Store,
    protected readonly cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.term$
        .pipe(
          tap((term: string) => {
            this.selectedSearchResultIndex = -1;
            this.term = term;
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.cdr.detectChanges();

    this.searchComponent.inputRef.nativeElement.onfocus = () => {
      this.selectedSearchResultIndex = -1;
    };
  }
  @HostListener('keydown.arrowdown', ['$event'])
  public handleArrowDown(event: KeyboardEvent) {
    this.handleArrowKey(event, 'down');
  }

  @HostListener('keydown.arrowup', ['$event'])
  public handleArrowUp(event: KeyboardEvent) {
    this.handleArrowKey(event, 'up');
  }

  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  public handleTab(event: KeyboardEvent) {
    // If we are tabbing from the search input, we need to set the index to the currently focused element
    if (this.selectedSearchResultIndex < 0) {
      // We need to wait for the next tick to get the currently focused element instead of the previously focused element
      setTimeout(() => {
        this.updateIndexToSelectedElement();
      }, 0);
    } else {
      const direction = event.shiftKey ? -1 : 1;
      // Find the next focusable element (first of group) and set focus on it
      for (let i = this.selectedSearchResultIndex + direction; i >= 0 && i < this.allSearchResults.length; i += direction) {
        const item = this.allSearchResults[i];
        if (item.isFocusable) {
          event.preventDefault();
          this.selectedSearchResultIndex = i;
          this.setFocusOnSelectedElement();
          return;
        }
      }
      // If there was no focusable element (move back from first group or forward from last group), we reset the index
      this.selectedSearchResultIndex = -1;
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  public handleEnter(event: KeyboardEvent) {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      event.preventDefault();
      const result = this.allSearchResults[this.selectedSearchResultIndex];
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
        if (this.selectedSearchResultIndex < 0) {
          this.selectedSearchResultIndex = this.allSearchResults.length - 1;
        } else {
          this.selectedSearchResultIndex--;
        }
        break;
      case 'down':
        if (this.selectedSearchResultIndex >= this.allSearchResults.length - 1) {
          this.selectedSearchResultIndex = -1;
        } else {
          this.selectedSearchResultIndex++;
        }
        break;
    }
  }

  private setFocusOnSelectedElement() {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      const selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.searchComponent.setTerm(selectedResult.text, false);
      selectedResult.host.nativeElement.focus();
    } else {
      this.searchComponent.inputRef.nativeElement.focus();
      this.searchComponent.setTerm(this.term, false);
    }
  }

  // This method syncs the selectedSearchResultIndex with the currently focused element
  // Used in cases where the focus is set outside of this class (i.e. tab key navigation) or when tab is pressed from the search input
  private updateIndexToSelectedElement() {
    const activeElement = document.activeElement;
    const focusableElements = this.allSearchResults.filter((item) => item.isFocusable);
    const activeResult = focusableElements.find((item) => item.host.nativeElement === activeElement);
    if (activeResult) {
      this.selectedSearchResultIndex = this.allSearchResults.indexOf(activeResult);
    }
  }
}
