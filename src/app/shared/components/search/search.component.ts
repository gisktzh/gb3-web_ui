import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, fromEvent, Observable, Subscription, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {SearchMode} from '../../types/search-mode.type';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit, OnDestroy {
  @Input() public placeholderText!: string;
  @Input() public showFilterButton: boolean = true;
  @Input() public mode: SearchMode = 'normal';

  @Output() public readonly changeSearchTermEvent = new EventEmitter<string>();
  @Output() public readonly clearSearchTermEvent = new EventEmitter<void>();
  @Output() public readonly openFilterEvent = new EventEmitter<void>();

  @ViewChild('searchInput') private readonly inputRef!: ElementRef;
  private readonly subscriptions: Subscription = new Subscription();

  public ngAfterViewInit() {
    this.subscriptions.add(this.searchInputHandler().subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public clearInput() {
    this.inputRef.nativeElement.value = '';
    this.clearSearchTermEvent.emit();
  }

  public openFilter() {
    this.openFilterEvent.emit();
  }

  private searchInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.inputRef.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value.trim()),
      distinctUntilChanged(),
      tap((value) => {
        // TODO WES remove
        console.log(value);
        this.changeSearchTermEvent.emit(value);
      }),
    );
  }
}
