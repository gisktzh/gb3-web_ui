import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteDialogComponent} from '../components/favourite-dialog/favourite-dialog.component';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {tap} from 'rxjs';
import {FavouriteListActions} from '../../state/map/actions/favourite-list.actions';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly gb3FavouritesService: Gb3FavouritesService
  ) {}

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
    return this.gb3FavouritesService.createFavourite({title, content: {a: 'b'}}).pipe(tap((res) => console.log(res))); // todo: use state
  }

  public loadFavourites() {
    return this.gb3FavouritesService.loadFavourites();
  }
}
