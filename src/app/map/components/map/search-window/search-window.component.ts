import {Component} from '@angular/core';
import {SearchService} from "../../../../search/services/search.service";
import {Subscription} from "rxjs";
import {SearchApiResponse} from "../../../../search/interfaces/search-api-response.interface";
import {AddressIndex} from "../../../../search/interfaces/address-index.interface";

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss']
})
export class SearchWindowComponent {

  private readonly subscriptions: Subscription = new Subscription();
  public searchResults: string[] = [];

  constructor(private searchService: SearchService) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public search(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const term = target.value;
    this.subscriptions.add(this.searchService.search('fme-addresses', term).subscribe(
      (response: SearchApiResponse) => {
        const hits = response.results[0].data.hits.hits;
        this.searchResults = [];
        if (hits.length > 0) {
          const hitAddresses = hits.map(hit => hit._source as AddressIndex);
          for (const hit of hitAddresses) {
            this.searchResults.push(`${hit.street} ${hit.no}, ${hit.plz} ${hit.town}`);
          }
        }
      }
    ));
  }
}
