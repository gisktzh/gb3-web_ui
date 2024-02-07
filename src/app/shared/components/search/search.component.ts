import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, fromEvent, Subject, Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';
import {SearchMode} from '../../types/search-mode.type';
import {map} from 'rxjs/operators';
import {selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {GeometrySearchApiResultMatch} from '../../services/apis/search/interfaces/search-api-result-match.interface';

const SEARCH_TERM_INPUT_DEBOUNCE_IN_MS = 300;

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public placeholderText!: string;
  @Input() public showFilterButton: boolean = true;
  @Input() public alwaysEnableClearButton: boolean = false;
  @Input() public showClearButton: boolean = true;
  @Input() public clearButtonLabel?: string;
  @Input() public mode: SearchMode = 'normal';
  @Input() public focusOnInit: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public isAnyFilterActive: boolean = false;
  @Input() public canSearchBeSetManually: boolean = false;

  @Output() public readonly focusEvent = new EventEmitter<void>();
  @Output() public readonly changeSearchTermEvent = new EventEmitter<string>();
  @Output() public readonly clearSearchTermEvent = new EventEmitter<void>();
  @Output() public readonly openFilterEvent = new EventEmitter<void>();

  public screenMode: ScreenMode = 'regular';
  public selectedSearchResult?: GeometrySearchApiResultMatch;

  @ViewChild('searchInput') private readonly inputRef!: ElementRef<HTMLInputElement>;
  private readonly term = new Subject<string>();
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
    this.setTerm('');
    this.clearSearchTermEvent.emit();
  }

  public openFilter() {
    this.openFilterEvent.emit();
  }

  private setTerm(term: string) {
    this.term.next(term);
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.term
        .pipe(
          map((term) => {
            this.inputRef.nativeElement.value = term;
            return term.trim();
          }),
          distinctUntilChanged(),
          tap((term) => {
            this.changeSearchTermEvent.emit(term);
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
    this.subscriptions.add(
      this.store
        .select(selectSelectedSearchResult)
        .pipe(
          tap((selectedSearchResult) => {
            this.selectedSearchResult = selectedSearchResult;
            if (this.canSearchBeSetManually) {
              // This is necessary to force it to be rendered in the next tick, otherwise, changedetection won't pick it up
              setTimeout(() => {
                this.inputRef.nativeElement.value = selectedSearchResult?.displayString ?? '';
              }, 0);
            }
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.store
        .select(selectTerm)
        .pipe(
          tap((term) => {
            if (!this.selectedSearchResult) {
              // This is necessary to force it to be rendered in the next tick, otherwise, changedetection won't pick it up
              setTimeout(() => {
                this.inputRef.nativeElement.value = term;
              }, 0);
            }
          }),
        )
        .subscribe(),
    );
  }
}
