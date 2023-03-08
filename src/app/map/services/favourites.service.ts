import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteDialogComponent} from '../components/favourite-dialog/favourite-dialog.component';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {tap} from 'rxjs';
import {FavouriteListActions} from '../../state/map/actions/favourite-list.actions';
import {selectActiveMapItems} from '../../state/map/reducers/active-map-item.reducer';
import {ActiveMapItem} from '../models/active-map-item.model';
import {FavouriteLayerConfiguration} from '../../shared/interfaces/favourite.interface';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private activeMapItems: ActiveMapItem[] = [];
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);

  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly gb3FavouritesService: Gb3FavouritesService
  ) {
    this.initSubscriptions();
  }

  public showFavouriteDialog() {
    const dialogRef = this.dialogService.open<FavouriteDialogComponent, undefined, boolean>(FavouriteDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        tap((isAborted) => {
          if (!isAborted) {
            this.store.dispatch(FavouriteListActions.loadFavourites());
          }
        })
      )
      .subscribe();
  }

  public createFavourite(title: string) {
    const currentConfiguration = this.getCurrentFavouriteConfiguration();

    return this.gb3FavouritesService.createFavourite({title, content: currentConfiguration}).pipe();
  }

  public loadFavourites() {
    return this.gb3FavouritesService.loadFavourites();
  }

  private initSubscriptions() {
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
