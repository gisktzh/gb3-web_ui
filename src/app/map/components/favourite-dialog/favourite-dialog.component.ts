import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {FavouritesService} from '../../services/favourites.service';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'favourite-dialog',
  templateUrl: './favourite-dialog.component.html',
  styleUrls: ['./favourite-dialog.component.scss']
})
export class FavouriteDialogComponent implements OnInit, OnDestroy {
  public nameFormControl!: FormControl<string | null>;
  public isSaving: boolean = false;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<FavouriteDialogComponent, boolean>,
    private readonly favouritesService: FavouritesService
  ) {}

  public get name() {
    return this.nameFormControl.value;
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.nameFormControl = new FormControl('', [Validators.min(5), Validators.required, Validators.pattern(/[\S]/)]);
  }

  public abort() {
    this.close(true);
  }

  public save() {
    if (this.name) {
      this.isSaving = true;

      this.subscriptions.add(
        this.favouritesService
          .createFavourite(this.name)
          .pipe(
            tap((value) => {
              this.isSaving = true;
              this.close();
            })
          )
          .subscribe()
      );
    }
  }

  private close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
