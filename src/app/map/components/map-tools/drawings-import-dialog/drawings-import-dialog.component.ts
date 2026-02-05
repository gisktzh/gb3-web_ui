import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ImportActions} from '../../../../state/map/actions/import.actions';
import {selectLoadingState} from '../../../../state/map/reducers/import.reducer';
import {Subscription, tap} from 'rxjs';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {DropZoneComponent} from '../../../../shared/components/drop-zone/drop-zone.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'drawings-import-dialog',
  templateUrl: './drawings-import-dialog.component.html',
  styleUrl: './drawings-import-dialog.component.scss',
  imports: [ApiDialogWrapperComponent, DropZoneComponent, MatButton],
})
export class DrawingsImportDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingsImportDialogComponent>>(MatDialogRef);

  public loadingState: LoadingState = undefined;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadingState$ = this.store.select(selectLoadingState);
  protected fileUploadErrorMessage = '';

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
    this.fileUploadErrorMessage = error;
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
