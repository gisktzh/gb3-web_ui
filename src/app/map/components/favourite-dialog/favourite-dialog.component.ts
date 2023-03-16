import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';
import {FavouritesService} from '../../services/favourites.service';
import {EMPTY, Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {Store} from '@ngrx/store';

const FAVOURITE_NAME_CONSTRAINTS: ValidatorFn[] = [Validators.minLength(5), Validators.required, Validators.pattern(/[\S]/)];

@Component({
  selector: 'favourite-dialog',
  templateUrl: './favourite-dialog.component.html',
  styleUrls: ['./favourite-dialog.component.scss']
})
export class FavouriteDialogComponent implements OnInit, OnDestroy {
  public nameFormControl!: FormControl<string | null>;
  public saveProgress?: 'saving' | 'error';
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<FavouriteDialogComponent, boolean>,
    private readonly favouritesService: FavouritesService,
    private readonly store: Store
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
    this.close();
  }

  public save() {
    if (this.name) {
      this.saveProgress = 'saving';

      this.subscriptions.add(
        this.favouritesService
          .createFavourite(this.name)
          .pipe(
            tap(() => {
              this.store.dispatch(FavouriteListActions.loadFavourites());
              this.close();
            }),
            catchError(() => {
              this.saveProgress = 'error';
              return EMPTY;
            })
          )
          .subscribe()
      );
    }
  }

  private close() {
    this.dialogRef.close();
  }
}
