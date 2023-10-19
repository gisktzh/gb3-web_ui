import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, debounceTime, distinctUntilChanged, fromEvent, map, tap} from 'rxjs';
import {ActiveMapItem} from 'src/app/map/models/active-map-item.model';
import {isActiveMapItemOfType} from 'src/app/shared/type-guards/active-map-item-type.type-guard';
import {selectIsAuthenticated} from 'src/app/state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from 'src/app/state/map/actions/active-map-item.actions';
import {LayerCatalogActions} from 'src/app/state/map/actions/layer-catalog.actions';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectItems} from 'src/app/state/map/reducers/active-map-item.reducer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';

type TabType = 'activeMaps' | 'mapsCatalogue';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Um einen Favoriten anzulegen, muss mindestens eine Karte hinzugefügt werden.',
  notAuthenticated: 'Um aktive Karten als Favorit speichern zu können, muss man angemeldet sein.',
  authenticatedAndMapsAdded: 'Aktive Karten als Favorit speichern',
};

@Component({
  selector: 'map-management-mobile',
  templateUrl: './map-management-mobile.component.html',
  styleUrls: ['./map-management-mobile.component.scss'],
})
export class MapManagementMobileComponent implements OnInit, OnDestroy, AfterViewInit {
  public activeMapItems: ActiveMapItem[] = [];
  public numberOfNotices: number = 0;
  public numberOfUnreadNotices: number = 0;
  public activeTab: TabType = 'mapsCatalogue';
  public isAuthenticated: boolean = false;
  public isSearching: boolean = false;
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeMapItems$ = this.store.select(selectItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(private readonly store: Store) {
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(this.filterInputHandler().subscribe());
  }

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
  }

  public changeTabs(tab: TabType) {
    this.activeTab = tab;
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public showFavouriteDialog() {
    this.store.dispatch(MapUiActions.showCreateFavouriteDialog());
  }

  public showMapNotices() {
    this.store.dispatch(MapUiActions.showMapNoticesDialog());
  }

  private filterInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value),
      distinctUntilChanged(),
      tap((event) => this.filterCatalog(event)),
    );
  }

  private filterCatalog(filterString: string) {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString}));
  }

  private updateNumberOfNotices(currentActiveMapItems: Gb2WmsActiveMapItem[]) {
    const activeMapItemsWithNotices = currentActiveMapItems.filter((activeMapItem) => activeMapItem.settings.notice);
    this.numberOfNotices = activeMapItemsWithNotices.length;
    this.numberOfUnreadNotices = activeMapItemsWithNotices.filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length;
  }

  public toggleIsSearching() {
    this.isSearching = !this.isSearching;
    this.store.dispatch(LayerCatalogActions.toggleIsSearching({isSearching: this.isSearching}));
  }

  public clearInput() {
    this.input.nativeElement.value = '';
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString: ''}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
            const gb2ActiveMapItems = currentActiveMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.updateNumberOfNotices(gb2ActiveMapItems);
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
          }),
        )
        .subscribe(),
    );
  }
}
