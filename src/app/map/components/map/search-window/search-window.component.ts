import {Component, OnDestroy} from '@angular/core';
import {SearchService} from "../../../../search/services/search.service";
import {Subscription} from "rxjs";
import {SearchApiResponse} from "../../../../search/interfaces/search-api-response.interface";
import {AddressIndex} from "../../../../search/interfaces/address-index.interface";
import {PlacesIndex} from "../../../../search/interfaces/places-index.interface";
import {SearchWindowElement} from "./interfaces/search-window-element.interface";

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss']
})
export class SearchWindowComponent implements OnDestroy {

  private readonly subscriptions: Subscription = new Subscription();
  public searchResults: SearchWindowElement[] = [];
  public mapResults: string[] = [];

  constructor(private searchService: SearchService) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public search(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const term = target.value;
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
  }
}
