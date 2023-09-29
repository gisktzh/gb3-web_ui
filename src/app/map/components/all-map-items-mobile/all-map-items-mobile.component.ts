import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectShowMapManagementMobile} from 'src/app/state/map/reducers/map-ui.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {selectItems} from '../../../state/map/reducers/active-map-item.reducer';
import {debounceTime, distinctUntilChanged, fromEvent, Observable, Subscription, tap, map} from 'rxjs';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {selectIsAuthenticated} from 'src/app/state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from 'src/app/state/map/actions/active-map-item.actions';

type TabType = 'activeMaps' | 'mapsCatalogue';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Fügen Sie mindestens 1 Karte hinzu, um einen Favoriten anzulegen.',
  notAuthenticated: 'Loggen Sie sich ein, um Favoriten hinzuzufügen.',
};

@Component({
  selector: 'all-map-items-mobile',
  templateUrl: './all-map-items-mobile.component.html',
  styleUrls: ['./all-map-items-mobile.component.scss'],
})
export class AllMapItemsMobileComponent implements OnInit, OnDestroy, AfterViewInit {
  public isVisible: boolean = false;
  public screenMode: ScreenMode = 'mobile';
  public activeMapItems: ActiveMapItem[] = [];
  public numberOfNotices: number = 0;
  public numberOfUnreadNotices: number = 0;
  public activeTab: TabType = 'mapsCatalogue';
  public isAuthenticated: boolean = false;
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly showMapManagementMobile$ = this.store.select(selectShowMapManagementMobile);
  private readonly screenMode$ = this.store.select(selectScreenMode);
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
    if (this.screenMode === 'mobile') {
      this.subscriptions.add(this.filterInputHandler().subscribe());
    }
  }

  public close() {
    this.store.dispatch(MapUiActions.hideMapManagementMobile());
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.showMapManagementMobile$
        .pipe(
          tap((showMapManagementMobile) => {
            this.isVisible = showMapManagementMobile;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
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
