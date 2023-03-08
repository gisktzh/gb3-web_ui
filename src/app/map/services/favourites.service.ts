import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteDialogComponent} from '../components/favourite-dialog/favourite-dialog.component';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly gb3FavouritesService: Gb3FavouritesService
  ) {}

  public addFavourite() {
    const dialogRef = this.dialogService.open<FavouriteDialogComponent, undefined, string | undefined>(FavouriteDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        tap((result) => {
          if (result) {
            this.gb3FavouritesService
              .createFavourite({title: result, content: {a: 'b'}})
              .pipe(tap((res) => console.log(res)))
              .subscribe(); // todo: use state
          }
        })
      )
      .subscribe();
  }

  public loadFavourites() {
    return this.gb3FavouritesService.loadFavourites();
  }
}
