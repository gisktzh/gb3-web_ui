import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, debounceTime, distinctUntilChanged, fromEvent, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectFilterGroups} from '../../../state/app/reducers/search.reducer';
import {ScreenMode} from '../../types/screen-size.type';
import {SearchMode} from '../../types/search-mode.type';

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

  @Output() public readonly focus = new EventEmitter<void>();
  @Output() public readonly changeSearchTermEvent = new EventEmitter<string>();
  @Output() public readonly clearSearchTermEvent = new EventEmitter<void>();
  @Output() public readonly openFilterEvent = new EventEmitter<void>();

  public isAnyFilterActive: boolean = false;
  public screenMode: ScreenMode = 'regular';

  @ViewChild('searchInput') private readonly inputRef!: ElementRef;
  private readonly filterGroups$ = this.store.select(selectFilterGroups);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  public constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(this.searchInputHandler().subscribe());
    if (this.focusOnInit) {
      this.inputRef.nativeElement.focus();
    }
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

  public openBottomSheet() {
    if (this.screenMode === 'mobile') {
      this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'search'}));
    }
  }

  private searchInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.inputRef.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value.trim()),
      distinctUntilChanged(),
      tap((value) => {
        this.changeSearchTermEvent.emit(value);
      }),
    );
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.filterGroups$
        .pipe(
          tap(
            (filterGroups) => (this.isAnyFilterActive = filterGroups.flatMap((group) => group.filters).some((filter) => filter.isActive)),
          ),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
