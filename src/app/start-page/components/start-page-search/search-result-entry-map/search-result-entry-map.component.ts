import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {SearchResultIdentifierDirective} from '../../../../shared/directives/search-result-identifier.directive';
import {Gb2ExitButtonComponent} from '../../../../shared/components/external-link-button/gb2-exit-button.component';
import {Router} from '@angular/router';

@Component({
  selector: 'search-result-entry-map',
  templateUrl: './search-result-entry-map.component.html',
  styleUrls: ['./search-result-entry-map.component.scss'],
  standalone: false,
})
export class SearchResultEntryMapComponent implements OnInit, OnDestroy {
  @Input() public filteredMaps: Map[] = [];
  @ViewChildren(SearchResultIdentifierDirective) public readonly searchResultElement!: QueryList<SearchResultIdentifierDirective>;
  @ViewChildren(Gb2ExitButtonComponent) public readonly gb2ExitButtons!: QueryList<Gb2ExitButtonComponent>;

  public mapConfigState?: MapConfigState;
  protected readonly mainPageEnum = MainPage;
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public delegateClickToChild(map: Map) {
    if (map.gb2Url) {
      const index = this.filteredMaps.indexOf(map);
      const searchResult = this.searchResultElement.toArray()[index];
      if (!searchResult) {
        return;
      }
      const url = map.gb2Url;
      const gb2Button = this.gb2ExitButtons.find((gb2ExitButton) => gb2ExitButton.url.includes(url));
      gb2Button?.anchor._elementRef.nativeElement.click();
    } else {
      this.router.navigate([`/${this.mainPageEnum.Maps}`], {queryParams: {mapId: map.id}});
    }
  }
}
