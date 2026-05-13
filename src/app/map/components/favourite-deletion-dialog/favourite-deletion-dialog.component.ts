import {Component, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {FavouritesService} from '../../services/favourites.service';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {Store} from '@ngrx/store';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FavouriteCouldNotBeRemoved} from '../../../shared/errors/favourite.errors';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatButton} from '@angular/material/button';
import {HasSavingStateSingal} from 'src/app/shared/interfaces/has-saving-state-signal.interface';

@Component({
  selector: 'app-favourite-deletion-dialog',
  templateUrl: './favourite-deletion-dialog.component.html',
  styleUrls: ['./favourite-deletion-dialog.component.scss'],
  imports: [ApiDialogWrapperComponent, MatButton],
})
export class FavouriteDeletionDialogComponent implements HasSavingStateSingal {
  private readonly dialogRef = inject<MatDialogRef<FavouriteDeletionDialogComponent, boolean>>(MatDialogRef);
  private readonly favouritesService = inject(FavouritesService);
  public readonly data = inject<{
    favourite: Favourite;
  }>(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  public readonly savingState = signal<LoadingState>(undefined);

  public async delete() {
    this.savingState.set('loading');

    try {
      await firstValueFrom(this.favouritesService.deleteFavourite(this.data.favourite));
      this.store.dispatch(FavouriteListActions.removeFavourite({id: this.data.favourite.id}));
      this.close();
    } catch (err: unknown) {
      this.savingState.set('error');
      throw new FavouriteCouldNotBeRemoved(err);
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
