import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteDialogComponent} from '../components/favourite-dialog/favourite-dialog.component';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {Observable, tap} from 'rxjs';
import {selectActiveMapItems} from '../../state/map/reducers/active-map-item.reducer';
import {ActiveMapItem} from '../models/active-map-item.model';
import {FavouriteLayerConfiguration, FavouritesResponse} from '../../shared/interfaces/favourite.interface';
import {map} from 'rxjs/operators';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {selectAvailableMaps} from '../../state/map/selectors/available-maps.selector';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private activeMapItems: ActiveMapItem[] = [];
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly availableMaps$ = this.store.select(selectAvailableMaps);
  private availableMaps: Map[] = [];

  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly gb3FavouritesService: Gb3FavouritesService
  ) {
    this.initSubscriptions();
  }

  public showFavouriteDialog() {
    this.dialogService.open(FavouriteDialogComponent);
  }

  public createFavourite(title: string): Observable<boolean> {
    const currentConfiguration = this.getCurrentFavouriteConfiguration();

    return this.gb3FavouritesService.createFavourite({title, content: currentConfiguration}).pipe(map(() => true));
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
   * @param favouriteLayerConfigurations
   * @private
   */
  public getActiveMapItemsForFavourite(favouriteLayerConfigurations: FavouriteLayerConfiguration[]): ActiveMapItem[] {
    const activeMapItems: ActiveMapItem[] = [];

    favouriteLayerConfigurations.forEach((configuration) => {
      const existingMap = structuredClone(this.availableMaps.find((availableMap) => availableMap.id === configuration.mapId));

      if (existingMap) {
        let subLayer: MapLayer | undefined = undefined;
        if (configuration.isSingleLayer) {
          subLayer = existingMap.layers.find((layer) => layer.id === configuration.layers[0].id);

          if (!subLayer) {
            throw new Error('Sublayer does not exist.');
          }
        } else {
          existingMap.layers.forEach((layer) => {
            const sublayerConfiguration = configuration.layers.find((favLayer) => favLayer.id === layer.id);

            // hide sublayer if it is a newly added layer to not interfere with favourite composition
            layer.visible = sublayerConfiguration ? sublayerConfiguration.visible : false;
          });
          // ensure consistent sorting order with saved configuration in favourite
          const sortIds = configuration.layers.map((layer) => layer.id);
          existingMap.layers.sort((a, b) => sortIds.indexOf(a.id) - sortIds.indexOf(b.id));
        }

        activeMapItems.push(new ActiveMapItem(existingMap, subLayer, configuration.visible, configuration.opacity));
      } else {
        throw new Error('Map does not exist');
      }
    });

    return activeMapItems;
  }

  private initSubscriptions() {
    this.availableMaps$.pipe(tap((value) => (this.availableMaps = value))).subscribe();
    this.activeMapItems$.pipe(tap((activeMapItems) => (this.activeMapItems = activeMapItems))).subscribe();
  }

  private getCurrentFavouriteConfiguration(): FavouriteLayerConfiguration[] {
    return this.activeMapItems.map((activeMapItem) => {
      // note: spread does not work here because ActiveMapItem is a class, hence too many attributes would be added to the object
      return {
        id: activeMapItem.id,
        mapId: activeMapItem.mapId,
        layers: activeMapItem.layers.map((layer) => ({id: layer.id, layer: layer.layer, visible: layer.visible})),
        visible: activeMapItem.visible,
        opacity: activeMapItem.opacity,
        isSingleLayer: activeMapItem.isSingleLayer
      };
    });
  }
}
