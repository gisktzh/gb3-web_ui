import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfigService} from '../../../../shared/services/config.service';
import {FileValidationError} from '../../../../shared/errors/file-upload.errors';
import {ImportActions} from '../../../../state/map/actions/import.actions';
import {selectLoadingState} from '../../../../state/map/reducers/import.reducer';
import {Subscription, tap} from 'rxjs';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'drawings-import-dialog',
  templateUrl: './drawings-import-dialog.component.html',
  styleUrl: './drawings-import-dialog.component.scss',
})
export class DrawingsImportDialogComponent implements OnInit, OnDestroy {
  public loadingState: LoadingState = undefined;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadingState$ = this.store.select(selectLoadingState);

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingsImportDialogComponent>,
    private readonly configService: ConfigService,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public cancel() {
    this.dialogRef.close();
  }

  public handleFileChange(file: Blob | File) {
    this.store.dispatch(ImportActions.requestDrawingsImport({file}));
    // todo: dispatch action, set upload state, handle response and errors, close, etc.
  }

  public handleFileErrors(error: string) {
    throw new FileValidationError(error);
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
