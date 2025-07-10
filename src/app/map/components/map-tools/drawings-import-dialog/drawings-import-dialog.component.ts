import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ImportActions} from '../../../../state/map/actions/import.actions';
import {selectLoadingState} from '../../../../state/map/reducers/import.reducer';
import {Subscription, tap} from 'rxjs';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'drawings-import-dialog',
  templateUrl: './drawings-import-dialog.component.html',
  styleUrl: './drawings-import-dialog.component.scss',
  standalone: false,
})
export class DrawingsImportDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingsImportDialogComponent>>(MatDialogRef);

  public loadingState: LoadingState = undefined;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadingState$ = this.store.select(selectLoadingState);

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public cancel() {
    this.dialogRef.close();
    this.store.dispatch(ImportActions.resetDrawingImportState());
  }

  public handleFileChange(file: Blob | File) {
    this.store.dispatch(ImportActions.requestDrawingsImport({file}));
  }

  public handleFileError(error: string) {
    this.store.dispatch(ImportActions.setFileValidationError({errorMessage: error}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap((loadingState) => {
            this.loadingState = loadingState;
            if (loadingState === 'loaded') {
              this.dialogRef.close();
            }
          }),
        )
        .subscribe(),
    );
  }
}
