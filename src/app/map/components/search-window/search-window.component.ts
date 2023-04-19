import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from "../../../shared/services/apis/search/services/search.service";
import {debounceTime, distinctUntilChanged, first, fromEvent, Observable, Subscription, tap} from "rxjs";
import {SearchWindowElement} from "../../../shared/services/apis/search/interfaces/search-window-element.interface";
import {Store} from "@ngrx/store";
import {Map} from "../../../shared/interfaces/topic.interface";
import {selectMaps} from "../../../state/map/selectors/maps.selector";
import {map} from "rxjs/operators";
import {ActiveMapItem} from "../../models/active-map-item.model";
import {ActiveMapItemActions} from "../../../state/map/actions/active-map-item.actions";
import {MAP_SERVICE} from "../../../app.module";
import {MapService} from "../../interfaces/map.service";
import {selectActiveMapItems} from "../../../state/map/reducers/active-map-item.reducer";
import {DEFAULT_SEARCHES, MAP_SEARCH, SPECIAL_SEARCH_CONFIG} from "../../../shared/constants/search.constants";
import {AvailableIndex} from "../../../shared/services/apis/search/interfaces/available-index.interface";

const DEFAULT_ZOOM_SCALE = 1000;

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss']
})
export class SearchWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchResults: SearchWindowElement[] = [];
  public specialSearchResults: SearchWindowElement[] = [];
  public filteredMaps: Map[] = [];
  public searchTerms: string[] = [];
  public availableSearchIndexes: AvailableIndex[] = DEFAULT_SEARCHES.concat(MAP_SEARCH);

  private originalMaps: Map[] = [];
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
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

  public zoomToResult(searchResult: SearchWindowElement) {
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
    const addressAndPlaceIndexes = this.availableSearchIndexes.slice(0, 2).filter(index => index.active).map(index => index.indexName);
    const specialIndexes = this.availableSearchIndexes.slice(2, -1).filter(index => index.active).map(index => index.indexName);
    const mapSearchActive = this.availableSearchIndexes[this.availableSearchIndexes.length -1].active;
    if (addressAndPlaceIndexes.length > 0) {
      this.subscriptions.add(this.searchService.searchIndexes(term, addressAndPlaceIndexes).pipe(first()).subscribe(
        (searchResults: SearchWindowElement[]) => {
          this.searchResults = searchResults;
        }
      ));
    } else {
      this.searchResults = [];
    }
    if (specialIndexes.length > 0) {
      this.subscriptions.add(this.searchService.searchIndexes(term, specialIndexes).pipe(first()).subscribe(
        (searchResults: SearchWindowElement[]) => {
          this.specialSearchResults = searchResults;
        }
      ));
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
      this.activeMapItems$
        .pipe(
          tap(async (value) => {
            this.availableSearchIndexes = DEFAULT_SEARCHES.concat(this.getActiveSpecialSearchIndexes(value)).concat(MAP_SEARCH);
          })
        )
        .subscribe()
    );
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }

  private getActiveSpecialSearchIndexes(activeMapItems: ActiveMapItem[]): AvailableIndex[] {
    const availableIndexes: AvailableIndex[] = [];

    for (const mapItem of activeMapItems) {
      for (const searchConfig of SPECIAL_SEARCH_CONFIG) {
        if (searchConfig.topics.includes(mapItem.id) && !availableIndexes.map(index => index.indexName).includes(searchConfig.index)) {
          availableIndexes.push({
            indexName: searchConfig.index,
            displayString: searchConfig.title,
            active: true
          });
        }
      }
    }
    return availableIndexes;

  }
}
