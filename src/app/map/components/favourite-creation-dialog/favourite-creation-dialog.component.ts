import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';
import {FavouritesService} from '../../services/favourites.service';
import {Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {Store} from '@ngrx/store';
import {LoadingState} from '../../../shared/types/loading-state.type';

import {FavouriteCouldNotBeCreated} from '../../../shared/errors/favourite.errors';

const FAVOURITE_NAME_CONSTRAINTS: ValidatorFn[] = [Validators.minLength(1), Validators.required, Validators.pattern(/\S/)];

@Component({
  selector: 'favourite-creation-dialog',
  templateUrl: './favourite-creation-dialog.component.html',
  styleUrls: ['./favourite-creation-dialog.component.scss'],
})
export class FavouriteCreationDialogComponent implements OnInit, OnDestroy, HasSavingState {
  public nameFormControl!: FormControl<string | null>;
  public savingState: LoadingState;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<FavouriteCreationDialogComponent>,
    private readonly favouritesService: FavouritesService,
    private readonly store: Store,
  ) {}

  public get name() {
    return this.nameFormControl.value;
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.nameFormControl = new FormControl('', FAVOURITE_NAME_CONSTRAINTS);
  }

  public abort() {
    this.close(true);
  }

  public save() {
    if (this.name) {
      this.savingState = 'loading';

      this.subscriptions.add(
        this.favouritesService
          .createFavourite(this.name)
          .pipe(
            tap(() => {
              this.store.dispatch(FavouriteListActions.loadFavourites());
              this.close();
            }),
            catchError((err: unknown) => {
              this.savingState = 'error';
              throw new FavouriteCouldNotBeCreated(err);
            }),
          )
          .subscribe(),
      );
    }
  }

  private close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
