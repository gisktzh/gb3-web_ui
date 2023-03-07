import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteDialogComponent} from '../components/favourite-dialog/favourite-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  constructor(private readonly store: Store, private readonly dialogService: MatDialog) {}

  public addFavourite() {
    const dialogRef = this.dialogService.open<FavouriteDialogComponent, undefined, string | undefined>(FavouriteDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('call API');
      } else {
        console.log('do nothing');
      }
    });
  }
}
