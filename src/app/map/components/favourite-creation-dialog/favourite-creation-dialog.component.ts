import {Component, inject, signal} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormsModule} from '@angular/forms';
import {FavouritesService} from '../../services/favourites.service';
import {firstValueFrom} from 'rxjs';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {Store} from '@ngrx/store';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FavouriteCouldNotBeCreated} from '../../../shared/errors/favourite.errors';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {HasSavingStateSingal} from 'src/app/shared/interfaces/has-saving-state-signal.interface';
import {form, minLength, pattern, required, FormField} from '@angular/forms/signals';

@Component({
  selector: 'favourite-creation-dialog',
  templateUrl: './favourite-creation-dialog.component.html',
  styleUrls: ['./favourite-creation-dialog.component.scss'],
  imports: [ApiDialogWrapperComponent, MatFormField, MatLabel, MatInput, FormsModule, MatError, MatButton, FormField],
})
export class FavouriteCreationDialogComponent implements HasSavingStateSingal {
  private readonly dialogRef = inject<MatDialogRef<FavouriteCreationDialogComponent>>(MatDialogRef);
  private readonly favouritesService = inject(FavouritesService);
  private readonly store = inject(Store);

  public readonly nameModel = signal<{name: string}>({name: ''});
  public nameForm = form(this.nameModel, (fieldPath) => {
    required(fieldPath.name);
    minLength(fieldPath.name, 1);
    pattern(fieldPath.name, /\S/);
  });

  public nameFormControl!: FormControl<string | null>;
  public readonly savingState = signal<LoadingState>(undefined);

  public abort() {
    this.close(true);
  }

  public async save() {
    if (this.nameForm().valid()) {
      this.savingState.set('loading');

      try {
        await firstValueFrom(this.favouritesService.createFavourite(this.nameModel().name));
        this.store.dispatch(FavouriteListActions.loadFavourites());
        this.close();
      } catch (err: unknown) {
        this.savingState.set('error');
        throw new FavouriteCouldNotBeCreated(err);
      }
    }
  }

  private close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
