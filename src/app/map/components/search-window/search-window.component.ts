import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from "../../../shared/services/apis/search/services/search.service";
import {debounceTime, distinctUntilChanged, first, fromEvent, Observable, Subscription, tap} from "rxjs";
import {SearchResultMatch} from "../../../shared/services/apis/search/interfaces/search-result-match.interface";
import {Store} from "@ngrx/store";
import {Map} from "../../../shared/interfaces/topic.interface";
import {selectMaps} from "../../../state/map/selectors/maps.selector";
import {map} from "rxjs/operators";
import {ActiveMapItem} from "../../models/active-map-item.model";
import {ActiveMapItemActions} from "../../../state/map/actions/active-map-item.actions";
import {MAP_SERVICE} from "../../../app.module";
import {MapService} from "../../interfaces/map.service";
import {DEFAULT_SEARCHES, MAP_SEARCH} from "../../../shared/constants/search.constants";
import {SearchIndex} from "../../../shared/services/apis/search/interfaces/search-index.interface";
import {selectAvailableSpecialSearchIndexes} from "../../../state/map/selectors/available-search-index.selector";

const DEFAULT_ZOOM_SCALE = 1000;

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

  private originalMaps: Map[] = [];
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly availableSpecialSearchIndexes$ = this.store.select(selectAvailableSpecialSearchIndexes);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(
    private searchService: SearchService,
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService
  ) {}

  public async ngOnInit() {
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

  public addActiveMap(activeMap: Map) {
    this.addActiveItem(new ActiveMapItem(activeMap));
  }

  public zoomToResult(searchResult: SearchResultMatch) {
    if (searchResult.geometry) {
      const point = searchResult.geometry;
      this.mapService.zoomToPoint(point, DEFAULT_ZOOM_SCALE);
    } else {
      console.log('Geometry not available in the index'); //todo: implement error handling
    }
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
    const defaultIndexes = this.availableSearchIndexes
      .filter(index => index.indexType === 'default' && index.active);
    const specialIndexes = this.availableSearchIndexes
      .filter(index => index.indexType === 'special' && index.active);
    const mapSearchActive = this.availableSearchIndexes
      .filter(index => index.indexType === 'map' && index.active)[0].active;
    if (defaultIndexes.length > 0) {
      this.subscriptions.add(this.searchService.searchIndexes(term, defaultIndexes)
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
      this.subscriptions.add(this.searchService.searchIndexes(term, specialIndexes)
        .pipe(
          first(),
          tap((searchResults: SearchResultMatch[]) => {
            this.specialSearchResults = searchResults;
          })
        ).subscribe()
      );
    } else {
      this.specialSearchResults = [];
    }
    if (mapSearchActive) {
      this.filteredMaps = this.originalMaps.filter(availableMap =>
        this.searchTerms.every(searchTerm => availableMap.title.toLowerCase().includes(searchTerm.toLowerCase()))
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
          tap(async (value) => {
            this.originalMaps = value;
          })
        )
        .subscribe()
    );
    this.subscriptions.add(
      this.availableSpecialSearchIndexes$
        .pipe(
          tap((value) => {
            this.availableSearchIndexes = DEFAULT_SEARCHES.concat(value).concat(MAP_SEARCH);
          })
        )
        .subscribe()
    );
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }
}
