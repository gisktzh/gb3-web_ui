import {Directive, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {SearchResultIdentifierDirective} from './search-result-identifier.directive';
import {Subscription, tap} from 'rxjs';
import {selectTerm} from '../../state/app/reducers/search.reducer';
import {Store} from '@ngrx/store';
import {SearchComponent} from '../components/search/search.component';

@Directive({
  selector: '[searchResultKeyboardNavigation]',
  standalone: true,
})
export class SearchResultKeyboardNavigationDirective implements OnInit, OnDestroy {
  @Input() public allSearchResults: SearchResultIdentifierDirective[] = [];
  @Input() public searchComponent?: SearchComponent;
  private term: string = '';
  private selectedSearchResultIndex: number = -1;
  private selectedResult: SearchResultIdentifierDirective | undefined;
  private readonly term$ = this.store.select(selectTerm).pipe(
    tap((term: string) => {
      this.selectedSearchResultIndex = -1;
      this.term = term;
    }),
  );
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(this.term$.subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  @HostListener('keydown.arrowdown', ['$event'])
  public handleArrowDown(event: KeyboardEvent) {
    this.handelArrowKey(event, 'down');
  }

  @HostListener('keydown.arrowup', ['$event'])
  public handleArrowUp(event: KeyboardEvent) {
    this.handelArrowKey(event, 'up');
  }

  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  public handleTab(event: KeyboardEvent) {
    // If there is no selected result, we don't need to do anything
    if (this.selectedSearchResultIndex < 0) {
      return;
    }
    this.selectedResult?.removeTemporaryMap();
    const direction = event.shiftKey ? -1 : 1;
    // Find the next focusable element (first of group) and set focus on it
    for (let i = this.selectedSearchResultIndex + direction; i >= 0 && i < this.allSearchResults.length; i += direction) {
      const item = this.allSearchResults[i] as SearchResultIdentifierDirective;
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

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  public handleEnter(event: KeyboardEvent) {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      event.preventDefault();
      const result = this.allSearchResults[this.selectedSearchResultIndex];
      result.host.nativeElement.click();
    }
  }

  private handelArrowKey(event: KeyboardEvent, direction: 'up' | 'down') {
    event.preventDefault();
    this.updateIndex(direction);
    this.setFocusOnSelectedElement();
  }

  private updateIndex(direction: 'up' | 'down') {
    this.selectedResult?.removeTemporaryMap();
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
      this.selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.searchComponent?.setTerm(this.selectedResult.text, false);
      this.selectedResult.host.nativeElement.focus();
      this.selectedResult.addTemporaryMap();
    } else {
      this.searchComponent?.inputRef.nativeElement.focus();
      this.searchComponent?.setTerm(this.term, false);
    }
  }
}
