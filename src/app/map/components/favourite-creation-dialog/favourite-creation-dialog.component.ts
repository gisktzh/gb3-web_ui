import {Component, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormsModule} from '@angular/forms';
import {CreateFavouritePayload, FavouritesService} from '../../services/favourites.service';
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
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'favourite-creation-dialog',
  templateUrl: './favourite-creation-dialog.component.html',
  styleUrls: ['./favourite-creation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ApiDialogWrapperComponent, MatFormField, MatLabel, MatInput, FormsModule, MatError, MatButton, FormField, MatCheckbox],
})
export class FavouriteCreationDialogComponent implements HasSavingStateSingal {
  private readonly dialogRef = inject<MatDialogRef<FavouriteCreationDialogComponent>>(MatDialogRef);
  private readonly favouritesService = inject(FavouritesService);
  private readonly store = inject(Store);

  public readonly model = signal<CreateFavouritePayload>({title: '', storeCenter: true, storeScale: true});
  public form = form(this.model, (fieldPath) => {
    required(fieldPath.title);
    minLength(fieldPath.title, 1);
    pattern(fieldPath.title, /\S/);
  });

  public nameFormControl!: FormControl<string | null>;
  public readonly savingState = signal<LoadingState>(undefined);

  public abort() {
    this.close(true);
  }

  public async save() {
    if (this.form().valid()) {
      this.savingState.set('loading');

      try {
        await firstValueFrom(this.favouritesService.createFavourite(this.model()));
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
