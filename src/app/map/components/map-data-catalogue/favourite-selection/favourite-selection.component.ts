import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../../shared/types/loading-state';
import {distinctUntilChanged, Subscription, tap} from 'rxjs';
import {Favourite} from '../../../../shared/interfaces/favourite.interface';
import {Store} from '@ngrx/store';
import {FavouriteListActions} from '../../../../state/map/actions/favourite-list.actions';
import {selectFavourites, selectLoadingState} from '../../../../state/map/reducers/favourite-list.reducer';
import {selectIsAuthenticated} from '../../../../state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {FavouritesService} from '../../../services/favourites.service';

const FAVOURITE_ERROR_TOOLTIP =
  'Der Favorit kann nicht angezeigt werden. Dies kann verschiedene Gründe haben - z.B. existiert eine (' +
  'oder mehrere) Karten innerhalb des Favorits nicht mehr.';

@Component({
  selector: 'favourite-selection',
  templateUrl: './favourite-selection.component.html',
  styleUrls: ['./favourite-selection.component.scss']
})
export class FavouriteSelectionComponent implements HasLoadingState, OnInit, OnDestroy {
  public favourites: Favourite[] = [];
  public loadingState: LoadingState = 'undefined';
  public isAuthenticated: boolean = false;
  public readonly errorTooltip: string = FAVOURITE_ERROR_TOOLTIP;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly favourites$ = this.store.select(selectFavourites);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor(private readonly store: Store, private readonly favouritesService: FavouritesService) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit(): void {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.favourites$.pipe(tap((favourites) => (this.favourites = favourites))).subscribe());
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          distinctUntilChanged(),
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;

            // This check is currently needed, because isAuthenticated might not be initialized yet
            if (this.isAuthenticated) {
              this.store.dispatch(FavouriteListActions.loadFavourites());
            }
          })
        )
        .subscribe()
    );
  }

  /**
   * Dispatches an action that adds a favourite to the map.
   * @param favouriteLayerConfigurations
   */
  public addFavouriteToMap({id, content}: Favourite) {
    try {
      const activeMapItemsForFavourite = this.favouritesService.getActiveMapItemsForFavourite(content);
      this.store.dispatch(ActiveMapItemActions.addFavourite({favourite: activeMapItemsForFavourite}));
    } catch (e) {
      this.store.dispatch(FavouriteListActions.setInvalid({id}));
    }
  }
}
