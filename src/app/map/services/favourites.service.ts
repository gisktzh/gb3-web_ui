import {Injectable, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {Observable, Subscription, tap} from 'rxjs';
import {ActiveMapItem} from '../models/active-map-item.model';
import {Favourite, FavouriteBaseConfig, FavouritesResponse} from '../../shared/interfaces/favourite.interface';
import {Map} from '../../shared/interfaces/topic.interface';
import {produce} from 'immer';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {ActiveMapItemConfiguration} from '../../shared/interfaces/active-map-item-configuration.interface';
import {selectActiveMapItemConfigurations} from '../../state/map/selectors/active-map-item-configuration.selector';
import {FavoritesDetailData} from '../../shared/models/gb3-api-generated.interfaces';
import {selectMaps} from '../../state/map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../state/map/selectors/favourite-base-config.selector';

@Injectable({
  providedIn: 'root',
})
export class FavouritesService implements OnDestroy {
  private activeMapItemConfigurations: ActiveMapItemConfiguration[] = [];
  private readonly activeMapItemConfigurations$ = this.store.select(selectActiveMapItemConfigurations);
  private readonly availableMaps$ = this.store.select(selectMaps);
  private availableMaps: Map[] = [];
  private readonly favouriteBaseConfig$ = this.store.select(selectFavouriteBaseConfig);
  private favouriteBaseConfig!: FavouriteBaseConfig;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly gb3FavouritesService: Gb3FavouritesService,
  ) {
    this.initSubscriptions();
  }

  public createFavourite(title: string): Observable<FavoritesDetailData> {
    return this.gb3FavouritesService.createFavourite({
      title,
      content: this.activeMapItemConfigurations,
      baseConfig: this.favouriteBaseConfig,
      drawings: [],
      measurements: [],
    });
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public loadFavourites(): Observable<FavouritesResponse> {
    return this.gb3FavouritesService.loadFavourites();
  }

  /**
   * Gets the active map items configured as per a saved favourite combination.
   *
   * Might throw in the following cases:
   * * A configuration declares a singleLayer, but its specified subLayer does not exist
   * * A configuration declares a map that does not exist
   *
   * Throws at the first occurrence of an error - this is to ensure that a favourite is somewhat stable, instead of showing only those parts
   * of the favourite that exist.
   * @param activeMapItemConfigurations
   * @private
   */
  public getActiveMapItemsForFavourite(activeMapItemConfigurations: ActiveMapItemConfiguration[]): ActiveMapItem[] {
    const activeMapItems: ActiveMapItem[] = [];

    activeMapItemConfigurations.forEach((configuration) => {
      const existingMap = this.availableMaps.find((availableMap) => availableMap.id === configuration.mapId);

      if (existingMap) {
        if (configuration.isSingleLayer) {
          const subLayer = existingMap.layers.find((layer) => layer.id === configuration.layers[0].id);

          if (!subLayer) {
            throw new Error('Sublayer does not exist.');
          }
          activeMapItems.push(
            ActiveMapItemFactory.createGb2WmsMapItem(existingMap, subLayer, configuration.visible, configuration.opacity),
          );
        } else {
          const adjustedMap = produce(existingMap, (draft) => {
            draft.layers.forEach((layer) => {
              const sublayerConfiguration = configuration.layers.find((favLayer) => favLayer.id === layer.id);

              // hide sublayer if it is a newly added layer to not interfere with favourite composition
              layer.visible = sublayerConfiguration ? sublayerConfiguration.visible : false;
            });
            // ensure consistent sorting order with saved configuration in favourite
            const sortIds = configuration.layers.map((layer) => layer.id);
            draft.layers.sort((a, b) => sortIds.indexOf(a.id) - sortIds.indexOf(b.id));
          });
          activeMapItems.push(
            ActiveMapItemFactory.createGb2WmsMapItem(adjustedMap, undefined, configuration.visible, configuration.opacity),
          );
        }
      } else {
        throw new Error('Map does not exist');
      }
    });

    return activeMapItems;
  }

  public deleteFavourite(favourite: Favourite): Observable<void> {
    return this.gb3FavouritesService.deleteFavourite(favourite);
  }

  private initSubscriptions() {
    this.subscriptions.add(this.availableMaps$.pipe(tap((value) => (this.availableMaps = value))).subscribe());
    this.subscriptions.add(
      this.activeMapItemConfigurations$
        .pipe(tap((activeMapItemConfigurations) => (this.activeMapItemConfigurations = activeMapItemConfigurations)))
        .subscribe(),
    );
    this.subscriptions.add(this.favouriteBaseConfig$.pipe(tap((mapConfig) => (this.favouriteBaseConfig = mapConfig))).subscribe());
  }
}
