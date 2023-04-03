import {Component, Inject, OnDestroy} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EMPTY, Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FavouritesService} from '../../services/favourites.service';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {Store} from '@ngrx/store';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {LoadingState} from '../../../shared/types/loading-state';

@Component({
  selector: 'app-favourite-deletion-dialog',
  templateUrl: './favourite-deletion-dialog.component.html',
  styleUrls: ['./favourite-deletion-dialog.component.scss']
})
export class FavouriteDeletionDialogComponent implements HasSavingState, OnDestroy {
  public savingState: LoadingState = 'undefined';
  public favourite: Favourite;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<FavouriteDeletionDialogComponent, boolean>,
    private readonly favouritesService: FavouritesService,
    @Inject(MAT_DIALOG_DATA) private readonly data: {favourite: Favourite},
    private readonly store: Store
  ) {
    this.favourite = data.favourite;
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public abort() {
    this.close();
  }

  public delete() {
    this.savingState = 'loading';

    this.subscriptions.add(
      this.favouritesService
        .deleteFavourite(this.favourite)
        .pipe(
          tap(() => {
            this.store.dispatch(FavouriteListActions.removeFavourite({id: this.favourite.id}));
            this.close();
          }),
          catchError(() => {
            this.savingState = 'error';
            return EMPTY;
          })
        )
        .subscribe()
    );
  }

  private close() {
    this.dialogRef.close();
  }
}
