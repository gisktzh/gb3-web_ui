import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from "../../../search/services/search.service";
import {debounceTime, distinctUntilChanged, fromEvent, Observable, Subscription, tap} from "rxjs";
import {SearchApiResponse} from "../../../search/interfaces/search-api-response.interface";
import {AddressIndex} from "../../../search/interfaces/address-index.interface";
import {PlacesIndex} from "../../../search/interfaces/places-index.interface";
import {SearchWindowElement} from "./interfaces/search-window-element.interface";
import {Store} from "@ngrx/store";
import {Map} from "../../../shared/interfaces/topic.interface";
import {selectMaps} from "../../../state/map/selectors/maps.selector";
import {map} from "rxjs/operators";

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss']
})
export class SearchWindowComponent implements OnInit, OnDestroy, AfterViewInit {


  public searchResults: SearchWindowElement[] = [];
  public filteredMaps: Map[] = [];

  private originalMaps: Map[] = [];
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(private searchService: SearchService, private readonly store: Store) {}

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
    if (term === '') {
      this.searchResults = [];
      this.filteredMaps = [];
    } else {
      this.subscriptions.add(this.searchService.search('fme-addresses,fme-places', term).subscribe(
        (response: SearchApiResponse) => {
          this.searchResults = [];
          const addressHits = response.results[0].data.hits.hits;
          if (addressHits.length > 0) {
            for (const hit of addressHits) {
              const hitSource = hit._source as AddressIndex;
              this.searchResults.push(<SearchWindowElement>{
                displayString: `${hitSource.street} ${hitSource.no}, ${hitSource.plz} ${hitSource.town}`,
                score: hit._score
              });
            }
          }
          const placesHits = response.results[1].data.hits.hits;
          if (placesHits.length > 0) {
            for (const hit of placesHits) {
              const hitSource = hit._source as PlacesIndex;
              this.searchResults.push(<SearchWindowElement>{
                displayString: `${hitSource.TYPE} ${hitSource.NAME}`,
                score: hit._score
              });
            }
          }
          this.searchResults.sort((a,b)=> b.score > a.score ? 1 : -1);
        }
      ));
      const singleTerms = term.split(' ');
      this.filteredMaps = this.originalMaps.filter(availableMap =>
        singleTerms.every(searchTerm => availableMap.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
  }
}
