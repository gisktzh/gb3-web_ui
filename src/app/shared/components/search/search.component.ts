import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, fromEvent, Subject, Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';
import {SearchMode} from '../../types/search-mode.type';
import {map} from 'rxjs/operators';

const SEARCH_TERM_INPUT_DEBOUNCE_IN_MS = 300;

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false,
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public placeholderText!: string;
  @Input() public showFilterButton: boolean = true;
  @Input() public alwaysEnableClearButton: boolean = false;
  @Input() public clearButtonLabel?: string;
  @Input() public mode: SearchMode = 'normal';
  @Input() public focusOnInit: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public isAnyFilterActive: boolean = false;

  @Output() public readonly focusEvent = new EventEmitter<void>();
  @Output() public readonly changeSearchTermEvent = new EventEmitter<string>();
  @Output() public readonly clearSearchTermEvent = new EventEmitter<void>();
  @Output() public readonly openFilterEvent = new EventEmitter<void>();

  public screenMode: ScreenMode = 'regular';

  @ViewChild('searchInput') public readonly inputRef!: ElementRef<HTMLInputElement>;
  private readonly searchTerm = new Subject<{term: string; emitChangeEvent: boolean}>();
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
  }

  public ngAfterViewInit() {
    this.initSubscriptions();
    if (this.focusOnInit) {
      this.inputRef.nativeElement.focus();
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public clearInput() {
    this.setTerm('', false);
    this.clearSearchTermEvent.emit();
  }

  public openFilter() {
    this.openFilterEvent.emit();
  }

  public setTerm(term: string, emitChangeEvent: boolean = true) {
    this.searchTerm.next({term, emitChangeEvent});
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.searchTerm
        .pipe(
          map((searchTerm) => {
            this.inputRef.nativeElement.value = searchTerm.term;
            return {...searchTerm, term: searchTerm.term};
          }),
          distinctUntilChanged((prev, curr) => {
            return prev.term === curr.term;
          }),
          tap((searchTerm) => {
            if (searchTerm.emitChangeEvent) {
              this.changeSearchTermEvent.emit(searchTerm.term);
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      fromEvent<KeyboardEvent>(this.inputRef.nativeElement, 'keyup')
        .pipe(
          debounceTime(SEARCH_TERM_INPUT_DEBOUNCE_IN_MS),
          tap((event) => {
            const term = (<HTMLInputElement>event.target).value;
            this.setTerm(term);
          }),
        )
        .subscribe(),
    );
  }
}
