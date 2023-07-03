import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {debounceTime, distinctUntilChanged, first, fromEvent, Observable, Subscription, tap} from 'rxjs';
import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {Store} from '@ngrx/store';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectMaps} from '../../../state/map/selectors/maps.selector';
import {map} from 'rxjs/operators';
import {DEFAULT_SEARCHES, MAP_SEARCH} from '../../../shared/constants/search.constants';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {selectAvailableSpecialSearchIndexes} from '../../../state/map/selectors/available-search-index.selector';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss']
})
export class SearchWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchResults: SearchResultMatch[] = [];
  public specialSearchResults: SearchResultMatch[] = [];
  public filteredMaps: Map[] = [];
  public searchTerms: string[] = [];
  public availableSearchIndexes: SearchIndex[] = DEFAULT_SEARCHES.concat(MAP_SEARCH);
  public isFilterMenuOpen = false;

  private originalMaps: Map[] = [];
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly availableSpecialSearchIndexes$ = this.store.select(selectAvailableSpecialSearchIndexes);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(private searchService: SearchService, private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(this.filterInputHandler().subscribe());
  }

  public search(term: string) {
    this.searchTerms = term.trim().split(' ');
    if (this.searchTerms.length === 1 && this.searchTerms[0] === '') {
      this.emptyResultsWindow();
    } else {
      this.fillResultsWindow(term);
    }
  }

  public toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  public closeFilterMenu() {
    this.isFilterMenuOpen = false;
  }

  public clearInput() {
    this.input.nativeElement.value = '';
    this.input.nativeElement.dispatchEvent(new KeyboardEvent('keyup'));
    this.emptyResultsWindow();
  }

  private emptyResultsWindow() {
    this.searchResults = [];
    this.filteredMaps = [];
    this.specialSearchResults = [];
  }

  private fillResultsWindow(term: string) {
    const defaultIndexes: SearchIndex[] = [];
    const specialIndexes: SearchIndex[] = [];
    let mapSearchActive = false;
    this.availableSearchIndexes
      .filter((index) => index.active)
      .forEach((index) => {
        switch (index.indexType) {
          case 'default': {
            defaultIndexes.push(index);
            break;
          }
          case 'special': {
            specialIndexes.push(index);
            break;
          }
          case 'map': {
            mapSearchActive = true;
            break;
          }
        }
      });
    if (defaultIndexes.length > 0) {
      this.subscriptions.add(
        this.searchService
          .searchIndexes(term, defaultIndexes)
          .pipe(
            first(),
            tap((searchResults: SearchResultMatch[]) => {
              this.searchResults = searchResults;
            })
          )
          .subscribe()
      );
    } else {
      this.searchResults = [];
    }
    if (specialIndexes.length > 0) {
      this.subscriptions.add(
        this.searchService
          .searchIndexes(term, specialIndexes)
          .pipe(
            first(),
            tap((searchResults: SearchResultMatch[]) => {
              this.specialSearchResults = searchResults;
            })
          )
          .subscribe()
      );
    } else {
      this.specialSearchResults = [];
    }
    if (mapSearchActive) {
      this.filteredMaps = this.originalMaps.filter((availableMap) =>
        this.searchTerms.every((searchTerm) => availableMap.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      this.filteredMaps = [];
    }
  }

  private filterInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value),
      distinctUntilChanged(),
      tap((event) => this.search(event))
    );
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.originalMaps$
        .pipe(
          tap((value) => {
            this.originalMaps = value;
          })
        )
        .subscribe()
    );
    this.subscriptions.add(
      this.availableSpecialSearchIndexes$
        .pipe(
          tap((value) => {
            this.availableSearchIndexes = [...DEFAULT_SEARCHES, ...value, MAP_SEARCH];
          })
        )
        .subscribe()
    );
  }
}
